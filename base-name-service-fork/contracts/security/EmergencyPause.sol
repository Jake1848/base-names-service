// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EmergencyPause
 * @dev Provides emergency pause functionality for critical contract operations
 * @notice This contract allows the owner to pause/unpause contract functionality
 * in case of emergencies, attacks, or critical bugs
 */
abstract contract EmergencyPause is Pausable, Ownable {

    event EmergencyPauseActivated(address indexed by, uint256 timestamp);
    event EmergencyPauseDeactivated(address indexed by, uint256 timestamp);

    /**
     * @dev Pauses all pausable functions in the contract
     * @notice Only the contract owner can call this function
     */
    function emergencyPause() external onlyOwner {
        _pause();
        emit EmergencyPauseActivated(msg.sender, block.timestamp);
    }

    /**
     * @dev Unpauses all pausable functions in the contract
     * @notice Only the contract owner can call this function
     */
    function emergencyUnpause() external onlyOwner {
        _unpause();
        emit EmergencyPauseDeactivated(msg.sender, block.timestamp);
    }

    /**
     * @dev Returns whether the contract is currently paused
     * @return bool True if paused, false otherwise
     */
    function isPaused() external view returns (bool) {
        return paused();
    }
}