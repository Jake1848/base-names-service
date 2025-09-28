//SPDX-License-Identifier: MIT
pragma solidity ~0.8.17;

import "../ethregistrar/IETHRegistrarController.sol";

/**
 * @title TestMaliciousContract
 * @dev A contract for testing reentrancy protection in the controller
 */
contract TestMaliciousContract {
    address public controller;
    bool public attacking = false;

    constructor(address _controller) {
        controller = _controller;
    }

    function attackRegister() external payable {
        attacking = true;

        // Create a registration struct
        IETHRegistrarController.Registration memory registration = IETHRegistrarController.Registration({
            label: "attack",
            owner: address(this),
            duration: 365 * 24 * 60 * 60,
            secret: keccak256("secret"),
            resolver: address(0),
            data: new bytes[](0),
            reverseRecord: 0,
            referrer: bytes32(0)
        });

        IETHRegistrarController(controller).register{value: msg.value}(registration);
    }

    receive() external payable {
        if (attacking) {
            // Try to reenter
            IETHRegistrarController.Registration memory registration = IETHRegistrarController.Registration({
                label: "reenter",
                owner: address(this),
                duration: 365 * 24 * 60 * 60,
                secret: keccak256("secret2"),
                resolver: address(0),
                data: new bytes[](0),
                reverseRecord: 0,
                referrer: bytes32(0)
            });

            IETHRegistrarController(controller).register{value: address(this).balance}(registration);
        }
    }
}