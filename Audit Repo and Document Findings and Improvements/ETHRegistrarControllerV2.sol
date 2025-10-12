pragma solidity ~0.8.17;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import {BaseRegistrarImplementationV2} from "./BaseRegistrarImplementationV2.sol";
import {StringUtils} from "../utils/StringUtils.sol";
import {Resolver} from "../resolvers/Resolver.sol";
import {ENS} from "../registry/ENS.sol";
import {IReverseRegistrar} from "../reverseRegistrar/IReverseRegistrar.sol";
import {IDefaultReverseRegistrar} from "../reverseRegistrar/IDefaultReverseRegistrar.sol";
import {IETHRegistrarController, IPriceOracle} from "./IETHRegistrarController.sol";
import {ERC20Recoverable} from "../utils/ERC20Recoverable.sol";
import {EmergencyPause} from "../security/EmergencyPause.sol";
import {RegistrationLimiter} from "../security/RegistrationLimiter.sol";
import {FeeManager} from "../security/FeeManager.sol";

/// @dev A registrar controller for registering and renewing names at fixed cost.
/// @dev V2: Works with BaseRegistrarImplementationV2 for metadata support
contract ETHRegistrarControllerV2 is
    Ownable,
    IETHRegistrarController,
    ERC165,
    ERC20Recoverable,
    EmergencyPause,
    ReentrancyGuard
{
    using StringUtils for *;

    /// @notice The bitmask for the Ethereum reverse record.
    uint8 constant REVERSE_RECORD_ETHEREUM_BIT = 1;

    /// @notice The bitmask for the default reverse record.
    uint8 constant REVERSE_RECORD_DEFAULT_BIT = 2;

    /// @notice The minimum duration for a registration.
    uint256 public constant MIN_REGISTRATION_DURATION = 28 days;

    // @notice Compute namehash using the registrar's configured base node.
    function _namehash(bytes32 labelhash) internal view returns (bytes32) {
        return keccak256(abi.encodePacked(base.baseNode(), labelhash));
    }

    /// @notice The maximum expiry time for a registration.
    uint64 private constant MAX_EXPIRY = type(uint64).max;

    /// @notice The ENS registry.
    ENS public immutable ens;

    // @notice The base registrar implementation V2 for the .base TLD (with metadata).
    BaseRegistrarImplementationV2 immutable base;

    /// @notice The minimum time a commitment must exist to be valid.
    uint256 public immutable minCommitmentAge;

    /// @notice The maximum time a commitment can exist to be valid.
    uint256 public immutable maxCommitmentAge;

    /// @notice The registrar for addr.reverse. (i.e. reverse for coinType 60)
    IReverseRegistrar public immutable reverseRegistrar;

    /// @notice The registrar for default.reverse. (i.e. fallback reverse for all EVM chains)
    IDefaultReverseRegistrar public immutable defaultReverseRegistrar;

    /// @notice The price oracle for the eth TLD.
    IPriceOracle public immutable prices;

    /// @notice The registration limiter for rate limiting.
    RegistrationLimiter public immutable registrationLimiter;

    /// @notice The fee manager for treasury operations.
    FeeManager public immutable feeManager;

    /// @notice A mapping of commitments to their timestamp.
    mapping(bytes32 => uint256) public commitments;

    /// @notice Referrer fee percentage (in basis points, e.g., 500 = 5%)
    uint256 public referrerFeePercentage = 500; // 5%

    /// @notice Event emitted when a referrer fee is paid
    event ReferrerFeePaid(address indexed referrer, uint256 amount);

    /// @notice Event emitted when the referrer fee percentage is changed
    event ReferrerFeePercentageChanged(uint256 oldPercentage, uint256 newPercentage);

    /// @notice Event emitted when funds are withdrawn to the fee manager
    event WithdrawalToFeeManager(uint256 amount);

    /// @notice Event emitted when a commitment is made
    event CommitmentMade(bytes32 indexed commitment, uint256 timestamp);

    /// @notice Thrown when a commitment is not found.
    error CommitmentNotFound(bytes32 commitment);

    /// @notice Thrown when a commitment is too new.
    error CommitmentTooNew(
