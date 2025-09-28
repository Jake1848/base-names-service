//SPDX-License-Identifier: MIT
pragma solidity ~0.8.17;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import {BaseRegistrarImplementation} from "./BaseRegistrarImplementation.sol";
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
/// @dev Modified from ENS ETHRegistrarController for Base Name Service (.base domains)
contract ETHRegistrarController is
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

    // @notice The base registrar implementation for the .base TLD.
    BaseRegistrarImplementation immutable base;

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
        bytes32 commitment,
        uint256 minimumCommitmentTimestamp,
        uint256 currentTimestamp
    );

    /// @notice Thrown when a commitment is too old.
    error CommitmentTooOld(
        bytes32 commitment,
        uint256 maximumCommitmentTimestamp,
        uint256 currentTimestamp
    );

    /// @notice Thrown when a name is not available to register.
    error NameNotAvailable(string name);

    /// @notice Thrown when the duration supplied for a registration is too short.
    error DurationTooShort(uint256 duration);

    /// @notice Thrown when data is supplied for a registration without a resolver.
    error ResolverRequiredWhenDataSupplied();

    /// @notice Thrown when a reverse record is requested without a resolver.
    error ResolverRequiredForReverseRecord();

    /// @notice Thrown when a matching unexpired commitment exists.
    error UnexpiredCommitmentExists(bytes32 commitment);

    /// @notice Thrown when the value sent for a registration is insufficient.
    error InsufficientValue();

    /// @notice Thrown when the maximum commitment age is too low.
    error MaxCommitmentAgeTooLow();

    /// @notice Thrown when the maximum commitment age is too high.
    error MaxCommitmentAgeTooHigh();

    /// @notice Emitted when a name is registered.
    ///
    /// @param label The label of the name.
    /// @param labelhash The keccak256 hash of the label.
    /// @param owner The owner of the name.
    /// @param baseCost The base cost of the name.
    /// @param premium The premium cost of the name.
    /// @param expires The expiry time of the name.
    /// @param referrer The referrer of the registration.
    event NameRegistered(
        string label,
        bytes32 indexed labelhash,
        address indexed owner,
        uint256 baseCost,
        uint256 premium,
        uint256 expires,
        bytes32 referrer
    );

    /// @notice Emitted when a name is renewed.
    ///
    /// @param label The label of the name.
    /// @param labelhash The keccak256 hash of the label.
    /// @param cost The cost of the name.
    /// @param expires The expiry time of the name.
    /// @param referrer The referrer of the registration.
    event NameRenewed(
        string label,
        bytes32 indexed labelhash,
        uint256 cost,
        uint256 expires,
        bytes32 referrer
    );

    /// @notice Constructor for the ETHRegistrarController.
    ///
    /// @param _base The base registrar implementation for the .base TLD.
    /// @param _prices The price oracle for the .base TLD.
    /// @param _minCommitmentAge The minimum time a commitment must exist to be valid.
    /// @param _maxCommitmentAge The maximum time a commitment can exist to be valid.
    /// @param _reverseRegistrar The registrar for addr.reverse.
    /// @param _defaultReverseRegistrar The registrar for default.reverse.
    /// @param _ens The ENS registry.
    constructor(
        BaseRegistrarImplementation _base,
        IPriceOracle _prices,
        uint256 _minCommitmentAge,
        uint256 _maxCommitmentAge,
        IReverseRegistrar _reverseRegistrar,
        IDefaultReverseRegistrar _defaultReverseRegistrar,
        ENS _ens,
        RegistrationLimiter _registrationLimiter,
        FeeManager _feeManager
    ) {
        // Ensure minimum commitment age is at least 1 minute
        require(_minCommitmentAge >= 1 minutes, "Min commitment age too low");

        // Ensure maximum commitment age is reasonable (max 30 days)
        require(_maxCommitmentAge <= 30 days, "Max commitment age too high");

        // Ensure max > min
        if (_maxCommitmentAge <= _minCommitmentAge)
            revert MaxCommitmentAgeTooLow();

        ens = _ens;
        base = _base;
        prices = _prices;
        minCommitmentAge = _minCommitmentAge;
        maxCommitmentAge = _maxCommitmentAge;
        reverseRegistrar = _reverseRegistrar;
        defaultReverseRegistrar = _defaultReverseRegistrar;
        registrationLimiter = _registrationLimiter;
        feeManager = _feeManager;
    }

    /// @notice Returns the price of a registration for the given label and duration.
    ///
    /// @param label The label of the name.
    /// @param duration The duration of the registration.
    /// @return price The price of the registration.
    function rentPrice(
        string calldata label,
        uint256 duration
    ) public view override returns (IPriceOracle.Price memory price) {
        bytes32 labelhash = keccak256(bytes(label));
        price = _rentPrice(string(label), labelhash, duration);
    }

    /// @notice Returns true if the label is valid for registration.
    /// Enforces:
    /// - Minimum length of 3 characters
    /// - Only lowercase letters (a-z), numbers (0-9), and hyphens (-)
    /// - Cannot start or end with a hyphen
    /// - Cannot contain consecutive hyphens
    ///
    /// @param label The label to check.
    /// @return True if the label is valid, false otherwise.
    function valid(string memory label) public pure returns (bool) {
        uint256 len = label.strlen();
        if (len < 3) return false;

        bytes memory labelBytes = bytes(label);

        // Check first and last character cannot be hyphen
        if (labelBytes[0] == 0x2d || labelBytes[len - 1] == 0x2d) return false;

        bool lastWasHyphen = false;
        for (uint256 i = 0; i < len; i++) {
            bytes1 char = labelBytes[i];

            // Check for valid characters: a-z (0x61-0x7a), 0-9 (0x30-0x39), hyphen (0x2d)
            bool isLowerLetter = (char >= 0x61 && char <= 0x7a);
            bool isDigit = (char >= 0x30 && char <= 0x39);
            bool isHyphen = (char == 0x2d);

            if (!isLowerLetter && !isDigit && !isHyphen) {
                return false;
            }

            // Check for consecutive hyphens
            if (isHyphen) {
                if (lastWasHyphen) return false;
                lastWasHyphen = true;
            } else {
                lastWasHyphen = false;
            }
        }

        return true;
    }

    /// @notice Returns true if the label is valid and available for registration.
    ///
    /// @param label The label to check.
    /// @return True if the label is valid and available, false otherwise.
    function available(
        string calldata label
    ) public view override returns (bool) {
        bytes32 labelhash = keccak256(bytes(label));
        return _available(string(label), labelhash);
    }

    /// @notice Returns the commitment for a registration.
    ///
    /// @param registration The registration to make a commitment for.
    /// @return commitment The commitment for the registration.
    function makeCommitment(
        Registration calldata registration
    ) public pure override returns (bytes32 commitment) {
        if (registration.data.length > 0 && registration.resolver == address(0))
            revert ResolverRequiredWhenDataSupplied();

        if (
            registration.reverseRecord != 0 &&
            registration.resolver == address(0)
        ) revert ResolverRequiredForReverseRecord();

        if (registration.duration < MIN_REGISTRATION_DURATION)
            revert DurationTooShort(registration.duration);

        return keccak256(abi.encode(registration));
    }

    // Overloaded version for backward compatibility with tests
    function makeCommitment(
        string calldata label,
        address owner,
        uint256 duration,
        bytes32 secret,
        address resolver,
        bytes[] calldata data,
        bool reverseRecord,
        bytes32 referrer,
        uint256 /* fuses - ignored for compatibility */
    ) public pure returns (bytes32 commitment) {
        Registration memory registration = Registration({
            label: label,
            owner: owner,
            duration: duration,
            secret: secret,
            resolver: resolver,
            data: data,
            reverseRecord: reverseRecord ? 1 : 0,
            referrer: referrer
        });

        if (registration.data.length > 0 && registration.resolver == address(0))
            revert ResolverRequiredWhenDataSupplied();

        if (
            registration.reverseRecord != 0 &&
            registration.resolver == address(0)
        ) revert ResolverRequiredForReverseRecord();

        if (registration.duration < MIN_REGISTRATION_DURATION)
            revert DurationTooShort(registration.duration);

        return keccak256(abi.encode(registration));
    }

    /// @notice Internal function to make commitment from memory struct
    function _makeCommitmentFromMemory(
        Registration memory registration
    ) internal pure returns (bytes32 commitment) {
        if (registration.data.length > 0 && registration.resolver == address(0))
            revert ResolverRequiredWhenDataSupplied();

        if (
            registration.reverseRecord != 0 &&
            registration.resolver == address(0)
        ) revert ResolverRequiredForReverseRecord();

        if (registration.duration < MIN_REGISTRATION_DURATION)
            revert DurationTooShort(registration.duration);

        return keccak256(abi.encode(registration));
    }

    /// @notice Commits a registration.
    ///
    /// @param commitment The commitment to commit.
    function commit(bytes32 commitment) public override whenNotPaused {
        if (commitments[commitment] + maxCommitmentAge >= block.timestamp) {
            revert UnexpiredCommitmentExists(commitment);
        }
        commitments[commitment] = block.timestamp;
        emit CommitmentMade(commitment, block.timestamp);
    }

    /// @notice Registers a name.
    ///
    /// @param registration The registration to register.
    /// @param registration.label The label of the name.
    /// @param registration.owner The owner of the name.
    /// @param registration.duration The duration of the registration.
    /// @param registration.resolver The resolver for the name.
    /// @param registration.data The data for the name.
    /// @param registration.reverseRecord Which reverse record(s) to set.
    /// @param registration.referrer The referrer of the registration.
    function register(
        Registration calldata registration
    ) public payable override nonReentrant whenNotPaused {
        _doRegistration(registration);
    }

    // Overloaded version for backward compatibility with tests
    function register(
        string calldata label,
        address owner,
        uint256 duration,
        bytes32 secret,
        address resolver,
        bytes[] calldata data,
        bool reverseRecord,
        bytes32 referrer,
        uint256 /* fuses - ignored for compatibility */
    ) external payable nonReentrant whenNotPaused {
        Registration memory reg = Registration(
            label,
            owner,
            duration,
            secret,
            resolver,
            data,
            reverseRecord ? 1 : 0,
            referrer
        );

        // Delegate to the internal registration function
        _doRegistrationFromMemory(reg);
    }

    function _doRegistration(Registration calldata registration) internal {
        // Convert to memory and call the memory version
        Registration memory reg = Registration({
            label: registration.label,
            owner: registration.owner,
            duration: registration.duration,
            secret: registration.secret,
            resolver: registration.resolver,
            data: registration.data,
            reverseRecord: registration.reverseRecord,
            referrer: registration.referrer
        });
        _doRegistrationFromMemory(reg);
    }

    function _doRegistrationFromMemory(Registration memory registration) internal {
        // Pre-check registration limit to fail fast without incrementing
        require(registrationLimiter.canRegister(msg.sender), "Registration limit exceeded");

        bytes32 labelhash = keccak256(bytes(registration.label));

        // Check if name is valid and available (inline to avoid memory/calldata issues)
        if (!valid(registration.label)) revert NameNotAvailable(registration.label);
        if (!base.available(uint256(labelhash))) revert NameNotAvailable(registration.label);
        if (_isInGracePeriod(labelhash)) revert NameNotAvailable(registration.label);

        // Get price (inline to avoid memory/calldata issues)
        IPriceOracle.Price memory price = prices.price(
            registration.label,
            base.nameExpires(uint256(labelhash)),
            registration.duration
        );
        uint256 totalPrice = price.base + price.premium;
        if (msg.value < totalPrice) revert InsufficientValue();

        bytes32 commitment = _makeCommitmentFromMemory(registration);
        uint256 commitmentTimestamp = commitments[commitment];

        // Require an old enough commitment.
        if (commitmentTimestamp + minCommitmentAge > block.timestamp)
            revert CommitmentTooNew(
                commitment,
                commitmentTimestamp + minCommitmentAge,
                block.timestamp
            );

        // If the commitment is too old, or the name is registered, stop
        if (commitmentTimestamp + maxCommitmentAge <= block.timestamp) {
            if (commitmentTimestamp == 0) revert CommitmentNotFound(commitment);
            revert CommitmentTooOld(
                commitment,
                commitmentTimestamp + maxCommitmentAge,
                block.timestamp
            );
        }

        delete (commitments[commitment]);

        // Record registration after all validations pass, before state-changing ops
        registrationLimiter.recordRegistration(msg.sender);

        uint256 expires;

        if (registration.resolver == address(0)) {
            expires = base.register(
                uint256(labelhash),
                registration.owner,
                registration.duration
            );
        } else {
            expires = base.register(
                uint256(labelhash),
                address(this),
                registration.duration
            );

            bytes32 namehash = _namehash(labelhash);
            ens.setRecord(
                namehash,
                registration.owner,
                registration.resolver,
                0
            );
            if (registration.data.length > 0)
                Resolver(registration.resolver).multicallWithNodeCheck(
                    namehash,
                    registration.data
                );

            base.transferFrom(
                address(this),
                registration.owner,
                uint256(labelhash)
            );

            if (registration.reverseRecord & REVERSE_RECORD_ETHEREUM_BIT != 0)
                reverseRegistrar.setNameForAddr(
                    msg.sender,
                    msg.sender,
                    registration.resolver,
                    string.concat(registration.label, ".base")
                );
            if (registration.reverseRecord & REVERSE_RECORD_DEFAULT_BIT != 0)
                defaultReverseRegistrar.setNameForAddr(
                    msg.sender,
                    msg.sender,
                    address(0),
                    string.concat(registration.label, ".base")
                );
        }

        emit NameRegistered(
            registration.label,
            labelhash,
            registration.owner,
            price.base,
            price.premium,
            expires,
            registration.referrer
        );

        // Handle referrer fee if referrer is provided
        if (registration.referrer != bytes32(0)) {
            address referrer = address(uint160(uint256(registration.referrer)));
            if (referrer != address(0)) {
                uint256 referrerFee = (totalPrice * referrerFeePercentage) / 10000;
                if (referrerFee > 0) {
                    Address.sendValue(payable(referrer), referrerFee);
                    emit ReferrerFeePaid(referrer, referrerFee);
                }
            }
        }

        if (msg.value > totalPrice)
            Address.sendValue(payable(msg.sender), msg.value - totalPrice);
    }

    /// @notice Renews a name.
    ///
    /// @param label The label of the name.
    /// @param duration The duration of the registration.
    /// @param referrer The referrer of the registration.
    function renew(
        string calldata label,
        uint256 duration,
        bytes32 referrer
    ) external payable override nonReentrant whenNotPaused {
        bytes32 labelhash = keccak256(bytes(label));

        IPriceOracle.Price memory price = _rentPrice(
            string(label),
            labelhash,
            duration
        );
        if (msg.value < price.base) revert InsufficientValue();

        uint256 expires = base.renew(uint256(labelhash), duration);

        emit NameRenewed(label, labelhash, price.base, expires, referrer);

        if (msg.value > price.base)
            Address.sendValue(payable(msg.sender), msg.value - price.base);
    }

    /// @notice Sets the referrer fee percentage (only owner)
    /// @param _referrerFeePercentage Fee percentage in basis points (e.g., 500 = 5%)
    function setReferrerFeePercentage(uint256 _referrerFeePercentage) external onlyOwner {
        require(_referrerFeePercentage <= 1000, "Fee cannot exceed 10%"); // Max 10%
        uint256 oldPercentage = referrerFeePercentage;
        referrerFeePercentage = _referrerFeePercentage;
        emit ReferrerFeePercentageChanged(oldPercentage, _referrerFeePercentage);
    }

    /// @notice Withdraws the balance of the contract through the FeeManager.
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            Address.sendValue(payable(address(feeManager)), balance);
            emit WithdrawalToFeeManager(balance);
        }
    }

    /// @notice Alias to withdraw funds to the FeeManager (some tooling may prefer distinct name)
    function withdrawToFeeManager() external onlyOwner {
        withdraw();
    }

    /// @inheritdoc IERC165
    function supportsInterface(
        bytes4 interfaceID
    ) public view override returns (bool) {
        return
            interfaceID == type(IETHRegistrarController).interfaceId ||
            super.supportsInterface(interfaceID);
    }

    /// @notice Allows the contract to receive ETH payments
    receive() external payable {}

    /* Internal functions */

    /// @notice Checks if a name is in its grace period
    /// @param labelhash The labelhash of the name to check
    /// @return True if the name is in grace period, false otherwise
    function _isInGracePeriod(bytes32 labelhash) internal view returns (bool) {
        uint256 tokenId = uint256(labelhash);
        try base.ownerOf(tokenId) returns (address) {
            // Token exists, check if in grace period
            uint256 expiry = base.nameExpires(tokenId);
            uint256 gracePeriod = base.GRACE_PERIOD();
            return block.timestamp <= expiry + gracePeriod && block.timestamp > expiry;
        } catch {
            // Token doesn't exist
            return false;
        }
    }

    function _rentPrice(
        string memory label,
        bytes32 labelhash,
        uint256 duration
    ) internal view returns (IPriceOracle.Price memory price) {
        price = prices.price(
            label,
            base.nameExpires(uint256(labelhash)),
            duration
        );
    }

    function _available(
        string memory label,
        bytes32 labelhash
    ) internal view returns (bool) {
        return valid(label) && base.available(uint256(labelhash)) && !_isInGracePeriod(labelhash);
    }
}
