// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./ReverseRegistrar.sol";
import "./IDefaultReverseRegistrar.sol";

/**
 * @title DefaultReverseRegistrar
 * @dev Default implementation of reverse registrar with IDefaultReverseRegistrar interface
 * @notice This contract provides reverse resolution for Base Name Service
 */
contract DefaultReverseRegistrar is ReverseRegistrar, IDefaultReverseRegistrar {
    constructor(ENS _ens) ReverseRegistrar(_ens) {}

    /**
     * @dev Sets the name for an address with specified owner and resolver.
     * @param addr The address to set the reverse record for.
     * @param owner The owner of the reverse record.
     * @param resolver The resolver to use for this reverse record.
     * @param name The name to set for the address.
     */
    function setNameForAddr(
        address addr,
        address owner,
        address resolver,
        string memory name
    ) public override(ReverseRegistrar, IDefaultReverseRegistrar) returns (bytes32) {
        return super.setNameForAddr(addr, owner, resolver, name);
    }
}