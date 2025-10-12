// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../ethregistrar/BaseRegistrarImplementation.sol";

/**
 * @title TestMinter
 * @notice Simple contract for minting domains for free during testing
 * @dev Owner-only. Must be authorized as a controller on BaseRegistrar
 */
contract TestMinter is Ownable {
    BaseRegistrarImplementation public immutable registrar;

    event TestMinted(string label, bytes32 indexed labelhash, address indexed owner, uint256 expires);

    constructor(address _registrar) {
        require(_registrar != address(0), "Invalid registrar");
        registrar = BaseRegistrarImplementation(_registrar);
    }

    /**
     * @notice Mint a domain for free (testing only)
     * @param label The domain label (e.g., "test")
     * @param owner The address that will own the domain
     * @param duration Duration in seconds (minimum 28 days)
     */
    function testMint(
        string calldata label,
        address owner,
        uint256 duration
    ) external onlyOwner returns (uint256 expires) {
        require(duration >= 28 days, "Duration too short");
        require(owner != address(0), "Invalid owner");

        bytes32 labelhash = keccak256(bytes(label));
        uint256 tokenId = uint256(labelhash);

        // Check if available
        require(registrar.available(tokenId), "Domain not available");

        // Register the domain
        expires = registrar.register(tokenId, owner, duration);

        emit TestMinted(label, labelhash, owner, expires);
    }

    /**
     * @notice Batch mint multiple domains
     * @param labels Array of domain labels
     * @param owners Array of owner addresses (must match labels length)
     * @param duration Duration in seconds for all domains
     */
    function testMintBatch(
        string[] calldata labels,
        address[] calldata owners,
        uint256 duration
    ) external onlyOwner {
        require(labels.length == owners.length, "Length mismatch");
        require(duration >= 28 days, "Duration too short");

        for (uint256 i = 0; i < labels.length; i++) {
            require(owners[i] != address(0), "Invalid owner");

            bytes32 labelhash = keccak256(bytes(labels[i]));
            uint256 tokenId = uint256(labelhash);

            if (registrar.available(tokenId)) {
                uint256 expires = registrar.register(tokenId, owners[i], duration);
                emit TestMinted(labels[i], labelhash, owners[i], expires);
            }
        }
    }

    /**
     * @notice Check if a domain is available
     * @param label The domain label
     * @return bool True if available
     */
    function isAvailable(string calldata label) external view returns (bool) {
        bytes32 labelhash = keccak256(bytes(label));
        return registrar.available(uint256(labelhash));
    }
}
