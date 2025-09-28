// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract MockReverseRegistrar {
    function setNameForAddr(
        address addr,
        address owner,
        address resolver,
        string memory name
    ) external returns (bytes32) {
        return bytes32(0);
    }

    receive() external payable {}
}