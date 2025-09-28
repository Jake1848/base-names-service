// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RegistrationLimiter
 * @dev Prevents abuse by limiting the number of registrations per address per time period
 * @notice This contract provides rate limiting functionality for domain registrations
 */
contract RegistrationLimiter is Ownable {

    // Maximum registrations per address per time window
    uint256 public maxRegistrationsPerWindow = 10;

    // Time window in seconds (default: 1 hour)
    uint256 public timeWindow = 3600;

    // Controller authorized to record registrations (e.g., the Registrar Controller)
    address public controller;

    // Track registrations per address per time window
    mapping(address => mapping(uint256 => uint256)) public registrations;

    event RegistrationLimitUpdated(uint256 newLimit);
    event TimeWindowUpdated(uint256 newWindow);
    event RegistrationRecorded(address indexed registrant, uint256 timeWindow, uint256 count);
    event ControllerUpdated(address indexed oldController, address indexed newController);

    modifier onlyController() {
        require(msg.sender == controller, "Not authorized");
        _;
    }

    /**
     * @dev Set the authorized controller contract
     * @param newController Address of the new controller
     */
    function setController(address newController) external onlyOwner {
        require(newController != address(0), "Invalid controller");
        address old = controller;
        controller = newController;
        emit ControllerUpdated(old, newController);
    }

    /**
     * @dev Check if an address can register (within limits)
     * @param registrant The address attempting to register
     * @return bool True if registration is allowed
     */
    function canRegister(address registrant) external view returns (bool) {
        uint256 currentWindow = block.timestamp / timeWindow;
        return registrations[registrant][currentWindow] < maxRegistrationsPerWindow;
    }

    /**
     * @dev Record a registration for rate limiting
     * @param registrant The address that registered
     *
     * Note: Only the authorized controller may call this to prevent griefing.
     */
    function recordRegistration(address registrant) external onlyController {
        uint256 currentWindow = block.timestamp / timeWindow;
        registrations[registrant][currentWindow]++;

        emit RegistrationRecorded(
            registrant,
            currentWindow,
            registrations[registrant][currentWindow]
        );

        require(
            registrations[registrant][currentWindow] <= maxRegistrationsPerWindow,
            "Registration limit exceeded for this time period"
        );
    }

    /**
     * @dev Get current registration count for an address
     * @param registrant The address to check
     * @return uint256 Number of registrations in current time window
     */
    function getCurrentRegistrations(address registrant) external view returns (uint256) {
        uint256 currentWindow = block.timestamp / timeWindow;
        return registrations[registrant][currentWindow];
    }

    /**
     * @dev Update the maximum registrations per time window
     * @param newLimit New maximum registrations allowed
     */
    function setMaxRegistrations(uint256 newLimit) external onlyOwner {
        require(newLimit > 0, "Limit must be greater than zero");
        maxRegistrationsPerWindow = newLimit;
        emit RegistrationLimitUpdated(newLimit);
    }

    /**
     * @dev Update the time window for rate limiting
     * @param newWindow New time window in seconds
     */
    function setTimeWindow(uint256 newWindow) external onlyOwner {
        require(newWindow > 0, "Time window must be greater than zero");
        timeWindow = newWindow;
        emit TimeWindowUpdated(newWindow);
    }
}
