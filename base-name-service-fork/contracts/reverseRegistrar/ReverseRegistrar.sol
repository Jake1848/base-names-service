// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../registry/ENS.sol";
import "./IDefaultReverseRegistrar.sol";
import "../resolvers/Resolver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract ReverseRegistrar is Ownable {
    using ECDSA for bytes32;

    ENS public immutable ens;
    bytes32 public immutable node;
    address public defaultResolver;

    event ReverseClaimed(address indexed addr, bytes32 indexed node);
    event DefaultResolverChanged(address indexed resolver);

    bytes32 constant ADDR_REVERSE_NODE = 0x91d1777781884d03a6757a803996e38de2a42967fb37eeaca72729271025a9e2;

    constructor(ENS _ens) {
        ens = _ens;
        node = ADDR_REVERSE_NODE;
    }

    modifier authorized(address addr) {
        require(
            addr == msg.sender ||
                isAuthorized(addr, msg.sender) ||
                ens.isApprovedForAll(addr, msg.sender),
            "ReverseRegistrar: Caller is not authorized"
        );
        _;
    }

    function isAuthorized(address addr, address caller) internal view returns (bool) {
        return addr == caller;
    }

    function setDefaultResolver(address resolver) external onlyOwner {
        require(resolver != address(0), "ReverseRegistrar: Resolver address cannot be zero");
        defaultResolver = resolver;
        emit DefaultResolverChanged(resolver);
    }

    function claim(address owner) public returns (bytes32) {
        return claimForAddr(msg.sender, owner, defaultResolver);
    }

    function claimForAddr(
        address addr,
        address owner,
        address resolver
    ) public authorized(addr) returns (bytes32) {
        bytes32 labelHash = sha256ToNode(addr);
        bytes32 reverseNode = keccak256(abi.encodePacked(node, labelHash));
        emit ReverseClaimed(addr, reverseNode);
        ens.setSubnodeRecord(node, labelHash, owner, resolver, 0);
        return reverseNode;
    }

    function claimWithResolver(
        address owner,
        address resolver
    ) public returns (bytes32) {
        return claimForAddr(msg.sender, owner, resolver);
    }

    function setName(string memory name) public returns (bytes32) {
        bytes32 reverseNode = claimForAddr(
            msg.sender,
            address(this),
            defaultResolver
        );
        if (defaultResolver != address(0)) {
            Resolver(defaultResolver).setName(reverseNode, name);
        }
        return reverseNode;
    }

    function setNameForAddr(
        address addr,
        address owner,
        address resolver,
        string memory name
    ) public virtual returns (bytes32) {
        bytes32 reverseNode = claimForAddr(addr, owner, resolver);
        if (resolver != address(0)) {
            Resolver(resolver).setName(reverseNode, name);
        }
        return reverseNode;
    }

    function sha256ToNode(address addr) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(reverse(abi.encodePacked(addr))));
    }

    function reverse(bytes memory _bytes) internal pure returns (bytes memory) {
        bytes memory reversed = new bytes(_bytes.length);
        for (uint i = 0; i < _bytes.length; i++) {
            reversed[_bytes.length - 1 - i] = _bytes[i];
        }
        return reversed;
    }
}