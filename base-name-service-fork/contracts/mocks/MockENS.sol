// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

/**
 * @dev Mock ENS Registry for testing
 */
contract MockENS {
    mapping(bytes32 => address) public owners;
    mapping(bytes32 => address) public resolvers;
    mapping(bytes32 => uint64) public ttls;

    event NewOwner(bytes32 indexed node, bytes32 indexed label, address owner);
    event Transfer(bytes32 indexed node, address owner);
    event NewResolver(bytes32 indexed node, address resolver);
    event NewTTL(bytes32 indexed node, uint64 ttl);

    function setOwner(bytes32 node, address owner) external {
        owners[node] = owner;
        emit Transfer(node, owner);
    }

    function setSubnodeOwner(bytes32 node, bytes32 label, address owner) external returns (bytes32) {
        bytes32 subnode = keccak256(abi.encodePacked(node, label));
        owners[subnode] = owner;
        emit NewOwner(node, label, owner);
        return subnode;
    }

    function setResolver(bytes32 node, address resolver) external {
        resolvers[node] = resolver;
        emit NewResolver(node, resolver);
    }

    function setTTL(bytes32 node, uint64 ttl) external {
        ttls[node] = ttl;
        emit NewTTL(node, ttl);
    }

    function owner(bytes32 node) external view returns (address) {
        return owners[node];
    }

    function resolver(bytes32 node) external view returns (address) {
        return resolvers[node];
    }

    function ttl(bytes32 node) external view returns (uint64) {
        return ttls[node];
    }

    function recordExists(bytes32 node) external view returns (bool) {
        return owners[node] != address(0);
    }
}
