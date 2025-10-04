// SPDX-License-Identifier: MIT
pragma solidity ~0.8.17;

import "./IPriceOracle.sol";
import "../utils/StringUtils.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

/**
 * @title TestnetPriceOracle
 * @dev CHEAP price oracle for Base Sepolia testnet - for FREE testing!
 * 100x cheaper than mainnet prices
 */
contract TestnetPriceOracle is IPriceOracle, ERC165 {
    using StringUtils for *;

    // SUPER CHEAP prices for testnet (100x cheaper than mainnet)
    uint256 public constant PRICE_3_CHAR = 0.005 ether;   // ~$0.01/year (was $1000)
    uint256 public constant PRICE_4_CHAR = 0.0005 ether;  // ~$0.001/year (was $100)
    uint256 public constant PRICE_5_PLUS = 0.00005 ether; // ~$0.0001/year (was $10)

    /**
     * @dev Returns the price for a name based on its length and duration
     * @param name The name being registered or renewed
     * @param duration How long the name is being registered or extended for, in seconds
     * @return Price struct containing base price and premium (premium is 0 for now)
     */
    function price(
        string calldata name,
        uint256, // expires (unused in our simple model)
        uint256 duration
    ) external pure override returns (IPriceOracle.Price memory) {
        uint256 len = name.strlen();

        uint256 basePrice;
        if (len >= 5) {
            basePrice = PRICE_5_PLUS * duration / 365 days;
        } else if (len == 4) {
            basePrice = PRICE_4_CHAR * duration / 365 days;
        } else if (len == 3) {
            basePrice = PRICE_3_CHAR * duration / 365 days;
        } else {
            // Names less than 3 chars not allowed
            basePrice = type(uint256).max;
        }

        return IPriceOracle.Price({
            base: basePrice,
            premium: 0 // No premium for testnet
        });
    }

    /**
     * @dev Returns the price for a name for 1 year
     */
    function price1Year(string calldata name) external pure returns (uint256) {
        uint256 len = name.strlen();

        if (len >= 5) {
            return PRICE_5_PLUS;
        } else if (len == 4) {
            return PRICE_4_CHAR;
        } else if (len == 3) {
            return PRICE_3_CHAR;
        } else {
            return type(uint256).max;
        }
    }

    /**
     * @dev Check if pricing is valid for a given duration
     */
    function supportsInterface(
        bytes4 interfaceID
    ) public view virtual override returns (bool) {
        return interfaceID == type(IPriceOracle).interfaceId ||
               super.supportsInterface(interfaceID);
    }
}
