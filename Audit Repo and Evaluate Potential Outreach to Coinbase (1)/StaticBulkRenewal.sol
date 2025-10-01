//SPDX-License-Identifier: MIT
pragma solidity ~0.8.17;

import "./ETHRegistrarController.sol";
import "./IBulkRenewal.sol";
import "./IPriceOracle.sol";

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract StaticBulkRenewal is IBulkRenewal {
    ETHRegistrarController controller;

    constructor(ETHRegistrarController _controller) {
        controller = _controller;
    }

    function rentPrice(
        string[] calldata names,
        uint256 duration
    ) external view override returns (uint256 total) {
        uint256 length = names.length;
        for (uint256 i = 0; i < length; ) {
            IPriceOracle.Price memory price = controller.rentPrice(
                names[i],
                duration
            );
            unchecked {
                ++i;
                total += (price.base + price.premium);
            }
        }
    }

    function renewAll(
        string[] calldata names,
        uint256 duration,
        bytes32 referrer
    ) external payable override {
        uint256 length = names.length;
        uint256 totalCost = 0;

        // 1. Calculate total cost first (Checks)
        for (uint256 i = 0; i < length; i++) {
            IPriceOracle.Price memory price = controller.rentPrice(
                names[i],
                duration
            );
            totalCost += (price.base + price.premium);
        }

        require(msg.value >= totalCost, "Insufficient payment sent for all renewals");

        // 2. Perform renewals (Interactions)
        for (uint256 i = 0; i < length; i++) {
            IPriceOracle.Price memory price = controller.rentPrice(
                names[i],
                duration
            );
            uint256 renewalPrice = price.base + price.premium;
            // The controller's renew function is payable, so we forward the specific amount for each renewal.
            controller.renew{value: renewalPrice}(names[i], duration, referrer);
        }

        // 3. Refund any excess funds sent by the user (Effect)
        uint256 excess = msg.value - totalCost;
        if (excess > 0) {
            Address.sendValue(payable(msg.sender), excess);
        }
    }

    function supportsInterface(
        bytes4 interfaceID
    ) external pure returns (bool) {
        return
            interfaceID == type(IERC165).interfaceId ||
            interfaceID == type(IBulkRenewal).interfaceId;
    }
}

