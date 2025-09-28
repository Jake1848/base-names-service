// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../registry/ENS.sol";
import "./IReverseRegistrar.sol";

abstract contract ReverseClaimer {
    bytes32 constant ADDR_REVERSE_NODE = 0x91d1777781884d03a6757a803996e38de2a42967fb37eeaca72729271025a9e2;

    function claimReverseENS(
        ENS ens,
        address claimant,
        address owner,
        address resolver
    ) internal returns (bytes32) {
        bytes32 labelHash = sha256HexAddress(claimant);
        bytes32 reverseNode = keccak256(
            abi.encodePacked(ADDR_REVERSE_NODE, labelHash)
        );
        ens.setSubnodeRecord(
            ADDR_REVERSE_NODE,
            labelHash,
            owner,
            resolver,
            0
        );
        return reverseNode;
    }

    function sha256HexAddress(address addr) private pure returns (bytes32 ret) {
        assembly {
            for {
                let i := 40
            } gt(i, 0) {

            } {
                i := sub(i, 1)
                mstore8(i, byte(and(addr, 0xf), "0123456789abcdef"))
                addr := shr(4, addr)
            }

            ret := keccak256(0, 40)
        }
    }
}