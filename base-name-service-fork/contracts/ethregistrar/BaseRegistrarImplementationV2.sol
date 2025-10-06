// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "../registry/ENS.sol";
import "./IBaseRegistrar.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IBaseNamesMetadata {
    function tokenURI(uint256 tokenId) external view returns (string memory);
    function setLabel(uint256 tokenId, string calldata label) external;
    function getLabel(uint256 tokenId) external view returns (string memory);
}

contract BaseRegistrarImplementationV2 is ERC721, IBaseRegistrar, Ownable {
    // A map of expiry times
    mapping(uint256 => uint256) expiries;
    // A map of token IDs to labels (domain names)
    mapping(uint256 => string) public labels;
    // The ENS registry
    ENS public ens;
    // The namehash of the TLD this registrar owns (eg, .eth)
    bytes32 public baseNode;
    // A map of addresses that are authorised to register and renew names.
    mapping(address => bool) public controllers;
    // The metadata contract
    IBaseNamesMetadata public metadataContract;

    uint256 public constant GRACE_PERIOD = 90 days;
    bytes4 private constant INTERFACE_META_ID =
        bytes4(keccak256("supportsInterface(bytes4)"));
    bytes4 private constant ERC721_ID =
        bytes4(
            keccak256("balanceOf(address)") ^
                keccak256("ownerOf(uint256)") ^
                keccak256("approve(address,uint256)") ^
                keccak256("getApproved(uint256)") ^
                keccak256("setApprovalForAll(address,bool)") ^
                keccak256("isApprovedForAll(address,address)") ^
                keccak256("transferFrom(address,address,uint256)") ^
                keccak256("safeTransferFrom(address,address,uint256)") ^
                keccak256("safeTransferFrom(address,address,uint256,bytes)")
        );
    bytes4 private constant RECLAIM_ID =
        bytes4(keccak256("reclaim(uint256,address)"));

    event MetadataContractUpdated(address indexed metadataContract);
    event LabelSet(uint256 indexed tokenId, string label);

    /// v2.1.3 version of _isApprovedOrOwner which calls ownerOf(tokenId) and takes grace period into consideration instead of ERC721.ownerOf(tokenId);
    /// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.1.3/contracts/token/ERC721/ERC721.sol#L187
    /// @dev Returns whether the given spender can transfer a given token ID
    /// @param spender address of the spender to query
    /// @param tokenId uint256 ID of the token to be transferred
    /// @return bool whether the msg.sender is approved for the given token ID,
    ///              is an operator of the owner, or is the owner of the token
    function _isApprovedOrOwner(
        address spender,
        uint256 tokenId
    ) internal view override returns (bool) {
        address owner = ownerOf(tokenId);
        return (spender == owner ||
            getApproved(tokenId) == spender ||
            isApprovedForAll(owner, spender));
    }

    constructor(
        ENS _ens,
        bytes32 _baseNode,
        address _metadataContract
    ) ERC721("Base Names", "BASE") {
        ens = _ens;
        baseNode = _baseNode;
        metadataContract = IBaseNamesMetadata(_metadataContract);
    }

    modifier live() {
        require(ens.owner(baseNode) == address(this));
        _;
    }

    modifier onlyController() {
        require(controllers[msg.sender]);
        _;
    }

    /// @dev Gets the owner of the specified token ID. Names become unowned
    ///      when their registration expires.
    /// @param tokenId uint256 ID of the token to query the owner of
    /// @return address currently marked as the owner of the given token ID
    function ownerOf(
        uint256 tokenId
    ) public view override(IERC721, ERC721) returns (address) {
        require(expiries[tokenId] > block.timestamp);
        return super.ownerOf(tokenId);
    }

    /// @dev Returns the token URI with metadata
    /// @param tokenId The token ID
    /// @return The complete data URI with JSON metadata
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");

        if (address(metadataContract) != address(0)) {
            return metadataContract.tokenURI(tokenId);
        }

        return "";
    }

    /// @dev Set the metadata contract address
    /// @param _metadataContract The metadata contract address
    function setMetadataContract(address _metadataContract) external onlyOwner {
        metadataContract = IBaseNamesMetadata(_metadataContract);
        emit MetadataContractUpdated(_metadataContract);
    }

    /// @dev Set label for a token ID (for migration or manual setting)
    /// @param tokenId The token ID
    /// @param label The domain label
    function setLabel(uint256 tokenId, string calldata label) external onlyOwner {
        labels[tokenId] = label;

        // Also set in metadata contract if available
        if (address(metadataContract) != address(0)) {
            metadataContract.setLabel(tokenId, label);
        }

        emit LabelSet(tokenId, label);
    }

    /// @dev Get label for a token ID
    /// @param tokenId The token ID
    /// @return The domain label
    function getLabel(uint256 tokenId) external view returns (string memory) {
        return labels[tokenId];
    }

    // Authorises a controller, who can register and renew domains.
    function addController(address controller) external override onlyOwner {
        controllers[controller] = true;
        emit ControllerAdded(controller);
    }

    // Revoke controller permission for an address.
    function removeController(address controller) external override onlyOwner {
        controllers[controller] = false;
        emit ControllerRemoved(controller);
    }

    // Check if an address is a controller
    function isController(address controller) external view returns (bool) {
        return controllers[controller];
    }

    // Approve an operator in the ENS Registry to act on behalf of this registrar
    function approveOperatorInENS(address operator, bool approved) external onlyOwner {
        ens.setApprovalForAll(operator, approved);
    }

    // Transfer ownership of the base node to a new owner (for contract migrations)
    function transferBaseNodeOwnership(address newOwner) external onlyOwner {
        ens.setOwner(baseNode, newOwner);
    }

    // Set the resolver for the TLD this registrar manages.
    function setResolver(address resolver) external override onlyOwner {
        ens.setResolver(baseNode, resolver);
    }

    // Returns the expiration timestamp of the specified id.
    function nameExpires(uint256 id) external view override returns (uint256) {
        return expiries[id];
    }

    // Returns true iff the specified name is available for registration.
    function available(uint256 id) public view override returns (bool) {
        // Not available if it's registered here or in its grace period.
        return expiries[id] + GRACE_PERIOD < block.timestamp;
    }

    /// @dev Register a name with label.
    /// @param id The token ID (keccak256 of the label).
    /// @param owner The address that should own the registration.
    /// @param duration Duration in seconds for the registration.
    /// @param label The domain label (name without .base)
    function registerWithLabel(
        uint256 id,
        address owner,
        uint256 duration,
        string calldata label
    ) external onlyController returns (uint256) {
        uint256 expiry = _register(id, owner, duration, true);

        // Store label
        labels[id] = label;

        // Set label in metadata contract
        if (address(metadataContract) != address(0)) {
            metadataContract.setLabel(id, label);
        }

        emit LabelSet(id, label);

        return expiry;
    }

    /// @dev Register a name.
    /// @param id The token ID (keccak256 of the label).
    /// @param owner The address that should own the registration.
    /// @param duration Duration in seconds for the registration.
    function register(
        uint256 id,
        address owner,
        uint256 duration
    ) external override returns (uint256) {
        return _register(id, owner, duration, true);
    }

    /// @dev Register a name, without modifying the registry.
    /// @param id The token ID (keccak256 of the label).
    /// @param owner The address that should own the registration.
    /// @param duration Duration in seconds for the registration.
    function registerOnly(
        uint256 id,
        address owner,
        uint256 duration
    ) external returns (uint256) {
        return _register(id, owner, duration, false);
    }

    function _register(
        uint256 id,
        address owner,
        uint256 duration,
        bool updateRegistry
    ) internal live onlyController returns (uint256) {
        require(available(id));
        require(
            block.timestamp + duration + GRACE_PERIOD >
                block.timestamp + GRACE_PERIOD
        ); // Prevent future overflow

        expiries[id] = block.timestamp + duration;
        if (_exists(id)) {
            // Name was previously owned, and expired
            _burn(id);
        }
        _mint(owner, id);
        if (updateRegistry) {
            ens.setSubnodeOwner(baseNode, bytes32(id), owner);
        }

        emit NameRegistered(id, owner, block.timestamp + duration);

        return block.timestamp + duration;
    }

    function renew(
        uint256 id,
        uint256 duration
    ) external override live onlyController returns (uint256) {
        require(expiries[id] + GRACE_PERIOD >= block.timestamp); // Name must be registered here or in grace period
        require(
            expiries[id] + duration + GRACE_PERIOD > duration + GRACE_PERIOD
        ); // Prevent future overflow

        expiries[id] += duration;
        emit NameRenewed(id, expiries[id]);
        return expiries[id];
    }

    /// @dev Reclaim ownership of a name in ENS, if you own it in the registrar.
    function reclaim(uint256 id, address owner) external override live {
        require(_isApprovedOrOwner(msg.sender, id));
        ens.setSubnodeOwner(baseNode, bytes32(id), owner);
    }

    function supportsInterface(
        bytes4 interfaceID
    ) public view override(ERC721, IERC165) returns (bool) {
        return
            interfaceID == INTERFACE_META_ID ||
            interfaceID == ERC721_ID ||
            interfaceID == RECLAIM_ID;
    }
}
