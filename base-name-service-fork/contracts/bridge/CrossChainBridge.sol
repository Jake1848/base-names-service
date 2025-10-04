// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title BaseNamesCrossChainBridge
 * @dev Enables Base Names domains to be bridged to other L2 chains
 * @notice This contract provides cross-chain functionality for .base domains
 */
contract BaseNamesCrossChainBridge is Ownable, ReentrancyGuard, Pausable {
    struct ChainConfig {
        uint256 chainId;
        address bridgeContract;
        uint256 bridgeFee;
        bool active;
        string name;
    }

    struct BridgeRequest {
        uint256 tokenId;
        address owner;
        uint256 sourceChain;
        uint256 targetChain;
        bytes32 requestHash;
        uint256 timestamp;
        bool completed;
    }

    mapping(uint256 => ChainConfig) public supportedChains;
    mapping(bytes32 => BridgeRequest) public bridgeRequests;
    mapping(uint256 => mapping(uint256 => bool)) public bridgedDomains; // tokenId => chainId => bridged

    uint256[] public chainIds;
    uint256 public bridgeFee = 0.001 ether;
    address public validator;

    event ChainAdded(uint256 indexed chainId, address bridgeContract, string name);
    event BridgeInitiated(
        bytes32 indexed requestHash,
        uint256 indexed tokenId,
        address indexed owner,
        uint256 sourceChain,
        uint256 targetChain
    );
    event BridgeCompleted(bytes32 indexed requestHash, uint256 indexed tokenId);
    event BridgeReverted(bytes32 indexed requestHash, string reason);
    event BridgeFeeUpdated(uint256 oldFee, uint256 newFee);
    event ValidatorUpdated(address oldValidator, address newValidator);

    constructor(address _validator) {
        require(_validator != address(0), "Invalid validator address");
        validator = _validator;
    }

    modifier onlyValidator() {
        require(msg.sender == validator, "Not validator");
        _;
    }

    /**
     * @dev Add a new supported chain for bridging
     * @param chainId The chain ID to add
     * @param bridgeContract The bridge contract address on the target chain
     * @param chainBridgeFee The fee for bridging to this chain
     * @param name Human-readable name of the chain
     */
    function addSupportedChain(
        uint256 chainId,
        address bridgeContract,
        uint256 chainBridgeFee,
        string calldata name
    ) external onlyOwner {
        require(chainId != block.chainid, "Cannot add current chain");
        require(!supportedChains[chainId].active, "Chain already supported");
        require(bridgeContract != address(0), "Invalid bridge contract");

        supportedChains[chainId] = ChainConfig({
            chainId: chainId,
            bridgeContract: bridgeContract,
            bridgeFee: chainBridgeFee,
            active: true,
            name: name
        });

        chainIds.push(chainId);

        emit ChainAdded(chainId, bridgeContract, name);
    }

    /**
     * @dev Initiate a bridge request to transfer domain to another chain
     * @param tokenId The domain token ID to bridge
     * @param targetChain The destination chain ID
     */
    function initiateBridge(
        uint256 tokenId,
        uint256 targetChain
    ) external payable nonReentrant whenNotPaused {
        require(supportedChains[targetChain].active, "Target chain not supported");
        require(msg.value >= bridgeFee, "Insufficient bridge fee");
        require(!bridgedDomains[tokenId][targetChain], "Domain already bridged to target chain");

        // Note: In production, verify domain ownership via BaseRegistrar
        // require(baseRegistrar.ownerOf(tokenId) == msg.sender, "Not domain owner");

        bytes32 requestHash = keccak256(
            abi.encodePacked(
                tokenId,
                msg.sender,
                block.chainid,
                targetChain,
                block.timestamp,
                block.number
            )
        );

        bridgeRequests[requestHash] = BridgeRequest({
            tokenId: tokenId,
            owner: msg.sender,
            sourceChain: block.chainid,
            targetChain: targetChain,
            requestHash: requestHash,
            timestamp: block.timestamp,
            completed: false
        });

        // Mark as bridged to prevent double bridging
        bridgedDomains[tokenId][targetChain] = true;

        emit BridgeInitiated(requestHash, tokenId, msg.sender, block.chainid, targetChain);
    }

    /**
     * @dev Complete a bridge request (validator only)
     * @param requestHash The hash of the bridge request
     * @param signature The validator's signature
     */
    function completeBridge(
        bytes32 requestHash,
        bytes calldata signature
    ) external onlyValidator nonReentrant {
        BridgeRequest storage request = bridgeRequests[requestHash];
        require(!request.completed, "Bridge already completed");
        require(request.timestamp > 0, "Invalid request");
        require(block.timestamp <= request.timestamp + 7 days, "Request expired");

        // Verify signature
        require(verifySignature(requestHash, signature), "Invalid signature");

        request.completed = true;

        // Note: In production, this would trigger cross-chain message
        // to mint/unlock domain on target chain

        emit BridgeCompleted(requestHash, request.tokenId);
    }

    /**
     * @dev Revert a failed bridge request (validator only)
     * @param requestHash The hash of the bridge request
     * @param reason The reason for reverting
     */
    function revertBridge(
        bytes32 requestHash,
        string calldata reason
    ) external onlyValidator nonReentrant {
        BridgeRequest storage request = bridgeRequests[requestHash];
        require(!request.completed, "Bridge already completed");
        require(request.timestamp > 0, "Invalid request");

        // Unmark as bridged
        bridgedDomains[request.tokenId][request.targetChain] = false;

        // Refund bridge fee
        (bool success, ) = payable(request.owner).call{value: bridgeFee}("");
        require(success, "Refund failed");

        emit BridgeReverted(requestHash, reason);
    }

    /**
     * @dev Verify validator signature
     * @param signature The signature to verify
     * @return bool True if signature is valid
     */
    function verifySignature(
        bytes32, /* requestHash */
        bytes calldata signature
    ) internal pure returns (bool) {
        // Simplified signature verification
        // In production, implement ECDSA signature recovery
        // and verify signer is the validator
        require(signature.length == 65, "Invalid signature length");
        return true; // Placeholder
    }

    /**
     * @dev Get list of all supported chain IDs
     * @return uint256[] Array of supported chain IDs
     */
    function getSupportedChains() external view returns (uint256[] memory) {
        return chainIds;
    }

    /**
     * @dev Get chain configuration
     * @param chainId The chain ID to query
     * @return ChainConfig The chain configuration
     */
    function getChainConfig(uint256 chainId) external view returns (ChainConfig memory) {
        return supportedChains[chainId];
    }

    /**
     * @dev Check if a domain has been bridged to a specific chain
     * @param tokenId The domain token ID
     * @param chainId The chain ID
     * @return bool True if domain is bridged to chain
     */
    function isDomainBridged(uint256 tokenId, uint256 chainId) external view returns (bool) {
        return bridgedDomains[tokenId][chainId];
    }

    /**
     * @dev Update bridge fee (owner only)
     * @param _fee The new bridge fee
     */
    function setBridgeFee(uint256 _fee) external onlyOwner {
        require(_fee <= 0.1 ether, "Fee too high");
        uint256 oldFee = bridgeFee;
        bridgeFee = _fee;
        emit BridgeFeeUpdated(oldFee, _fee);
    }

    /**
     * @dev Update validator address (owner only)
     * @param _validator The new validator address
     */
    function setValidator(address _validator) external onlyOwner {
        require(_validator != address(0), "Invalid validator address");
        address oldValidator = validator;
        validator = _validator;
        emit ValidatorUpdated(oldValidator, _validator);
    }

    /**
     * @dev Disable a supported chain (owner only)
     * @param chainId The chain ID to disable
     */
    function disableChain(uint256 chainId) external onlyOwner {
        require(supportedChains[chainId].active, "Chain not active");
        supportedChains[chainId].active = false;
    }

    /**
     * @dev Enable a previously disabled chain (owner only)
     * @param chainId The chain ID to enable
     */
    function enableChain(uint256 chainId) external onlyOwner {
        require(supportedChains[chainId].chainId != 0, "Chain not configured");
        require(!supportedChains[chainId].active, "Chain already active");
        supportedChains[chainId].active = true;
    }

    /**
     * @dev Pause bridge operations (owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause bridge operations (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency withdraw of contract funds (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Allow contract to receive ETH
     */
    receive() external payable {}
}
