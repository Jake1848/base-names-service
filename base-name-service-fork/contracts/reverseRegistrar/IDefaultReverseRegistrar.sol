//SPDX-License-Identifier: MIT
pragma solidity ~0.8.17;

interface IDefaultReverseRegistrar {
    function setNameForAddr(
        address addr,
        address owner,
        address resolver,
        string memory name
    ) external returns (bytes32);
}