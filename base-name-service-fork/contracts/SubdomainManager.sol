// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./registry/ENS.sol";
import "./ethregistrar/BaseRegistrarImplementation.sol";

/**
 * @title SubdomainManager
 * @dev Allows domain owners to create and manage subdomains
 */
contract SubdomainManager is Ownable {
    ENS public immutable ens;
    BaseRegistrarImplementation public immutable registrar;

    // Events
    event SubdomainCreated(
        bytes32 indexed parentNode,
        bytes32 indexed labelHash,
        string label,
        address indexed owner,
        address resolver
    );

    event SubdomainOwnershipTransferred(
        bytes32 indexed subnode,
        address indexed previousOwner,
        address indexed newOwner
    );

    // Errors
    error NotAuthorized(bytes32 node, address caller);
    error InvalidLabel(string label);
    error SubdomainAlreadyExists(bytes32 subnode);

    constructor(ENS _ens, BaseRegistrarImplementation _registrar) {
        ens = _ens;
        registrar = _registrar;
    }

    /**
     * @dev Check if an address is authorized to manage a domain
     */
    function isAuthorized(bytes32 node, address addr) public view returns (bool) {
        address owner = ens.owner(node);
        return owner == addr || ens.isApprovedForAll(owner, addr);
    }

    /**
     * @dev Create a subdomain
     * @param parentNode The parent domain node
     * @param label The subdomain label (e.g., "www" for www.example.base)
     * @param owner The owner of the new subdomain
     * @param resolver The resolver for the new subdomain
     */
    function createSubdomain(
        bytes32 parentNode,
        string calldata label,
        address owner,
        address resolver
    ) external {
        // Verify caller is authorized to manage the parent domain
        if (!isAuthorized(parentNode, msg.sender)) {
            revert NotAuthorized(parentNode, msg.sender);
        }

        // Validate label
        if (bytes(label).length == 0 || bytes(label).length > 64) {
            revert InvalidLabel(label);
        }

        bytes32 labelHash = keccak256(bytes(label));
        bytes32 subnode = keccak256(abi.encodePacked(parentNode, labelHash));

        // Check if subdomain already exists
        if (ens.owner(subnode) != address(0)) {
            revert SubdomainAlreadyExists(subnode);
        }

        // Create the subdomain
        ens.setSubnodeOwner(parentNode, labelHash, owner);

        // Set resolver if provided
        if (resolver != address(0)) {
            ens.setResolver(subnode, resolver);
        }

        emit SubdomainCreated(parentNode, labelHash, label, owner, resolver);
    }

    /**
     * @dev Transfer ownership of a subdomain
     * @param subnode The subdomain node
     * @param newOwner The new owner
     */
    function transferSubdomainOwnership(bytes32 subnode, address newOwner) external {
        if (!isAuthorized(subnode, msg.sender)) {
            revert NotAuthorized(subnode, msg.sender);
        }

        address currentOwner = ens.owner(subnode);
        ens.setOwner(subnode, newOwner);

        emit SubdomainOwnershipTransferred(subnode, currentOwner, newOwner);
    }

    /**
     * @dev Set resolver for a subdomain
     * @param subnode The subdomain node
     * @param resolver The new resolver
     */
    function setSubdomainResolver(bytes32 subnode, address resolver) external {
        if (!isAuthorized(subnode, msg.sender)) {
            revert NotAuthorized(subnode, msg.sender);
        }

        ens.setResolver(subnode, resolver);
    }

    /**
     * @dev Helper function to calculate subdomain node
     * @param parentNode The parent domain node
     * @param label The subdomain label
     */
    function getSubdomainNode(bytes32 parentNode, string calldata label)
        external
        pure
        returns (bytes32)
    {
        bytes32 labelHash = keccak256(bytes(label));
        return keccak256(abi.encodePacked(parentNode, labelHash));
    }

    /**
     * @dev Check if a subdomain exists
     * @param parentNode The parent domain node
     * @param label The subdomain label
     */
    function subdomainExists(bytes32 parentNode, string calldata label)
        external
        view
        returns (bool)
    {
        bytes32 labelHash = keccak256(bytes(label));
        bytes32 subnode = keccak256(abi.encodePacked(parentNode, labelHash));
        return ens.owner(subnode) != address(0);
    }

    /**
     * @dev Get subdomain owner
     * @param parentNode The parent domain node
     * @param label The subdomain label
     */
    function getSubdomainOwner(bytes32 parentNode, string calldata label)
        external
        view
        returns (address)
    {
        bytes32 labelHash = keccak256(bytes(label));
        bytes32 subnode = keccak256(abi.encodePacked(parentNode, labelHash));
        return ens.owner(subnode);
    }
}