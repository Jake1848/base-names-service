//SPDX-License-Identifier: MIT
pragma solidity ~0.8.17;

// Import only the core contracts we need for deployment
import "./registry/ENSRegistry.sol";
import "./ethregistrar/BaseRegistrarImplementation.sol";
import "./ethregistrar/ETHRegistrarController.sol";
import "./ethregistrar/BasePriceOracle.sol";

// This contract exists only to ensure the core contracts compile
contract BaseMinimal {
    // Empty contract
}