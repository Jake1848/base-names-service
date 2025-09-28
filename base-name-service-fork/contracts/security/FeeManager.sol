// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title FeeManager
 * @dev Manages fee collection, withdrawal limits, and treasury operations
 * @notice This contract provides secure fee management for the Base Name Service
 */
contract FeeManager is Ownable, ReentrancyGuard {

    // Treasury address for collected fees
    address public treasury;

    // Maximum single withdrawal amount (in wei)
    uint256 public maxWithdrawal = 100 ether;

    // Withdrawal timelock (24 hours)
    uint256 public constant WITHDRAWAL_DELAY = 24 hours;

    // Circuit breaker for freezing withdrawals in emergencies
    bool public withdrawalsFrozen = false;

    // Pending withdrawals
    struct PendingWithdrawal {
        uint256 amount;
        uint256 timestamp;
        address recipient;
        bool executed;
    }

    mapping(bytes32 => PendingWithdrawal) public pendingWithdrawals;

    // Monotonic nonce to ensure unique withdrawal IDs
    uint256 public withdrawalNonce;

    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event WithdrawalRequested(bytes32 indexed withdrawalId, uint256 amount, address recipient);
    event WithdrawalExecuted(bytes32 indexed withdrawalId, uint256 amount, address recipient);
    event WithdrawalCancelled(bytes32 indexed withdrawalId);
    event MaxWithdrawalUpdated(uint256 newMaxWithdrawal);
    event WithdrawalsFrozen();
    event WithdrawalsUnfrozen();

    modifier whenWithdrawalsNotFrozen() {
        require(!withdrawalsFrozen, "Withdrawals are frozen");
        _;
    }

    constructor(address _treasury) {
        require(_treasury != address(0), "Treasury cannot be zero address");
        treasury = _treasury;
    }

    /**
     * @dev Request a withdrawal (with timelock)
     * @param amount Amount to withdraw
     * @param recipient Recipient of the withdrawal
     * @return withdrawalId ID of the withdrawal request
     */
    function requestWithdrawal(
        uint256 amount,
        address recipient
    ) external onlyOwner whenWithdrawalsNotFrozen returns (bytes32 withdrawalId) {
        require(amount <= maxWithdrawal, "Amount exceeds maximum withdrawal");
        require(amount <= address(this).balance, "Insufficient contract balance");
        require(recipient != address(0), "Invalid recipient");

        // Increment nonce then use it in ID derivation to avoid collisions
        unchecked { withdrawalNonce += 1; }
        withdrawalId = keccak256(abi.encodePacked(
            amount,
            recipient,
            withdrawalNonce,
            msg.sender,
            block.chainid
        ));

        pendingWithdrawals[withdrawalId] = PendingWithdrawal({
            amount: amount,
            timestamp: block.timestamp,
            recipient: recipient,
            executed: false
        });

        emit WithdrawalRequested(withdrawalId, amount, recipient);
    }

    /**
     * @dev Execute a pending withdrawal (after timelock)
     * @param withdrawalId ID of the withdrawal to execute
     */
    function executeWithdrawal(bytes32 withdrawalId) external nonReentrant onlyOwner whenWithdrawalsNotFrozen {
        PendingWithdrawal storage withdrawal = pendingWithdrawals[withdrawalId];

        require(!withdrawal.executed, "Withdrawal already executed");
        require(withdrawal.amount > 0, "Withdrawal does not exist");
        require(
            block.timestamp >= withdrawal.timestamp + WITHDRAWAL_DELAY,
            "Withdrawal still in timelock period"
        );

        withdrawal.executed = true;

        (bool success, ) = withdrawal.recipient.call{value: withdrawal.amount}("");
        require(success, "Withdrawal transfer failed");

        emit WithdrawalExecuted(withdrawalId, withdrawal.amount, withdrawal.recipient);
    }

    /**
     * @dev Cancel a pending withdrawal
     * @param withdrawalId ID of the withdrawal to cancel
     */
    function cancelWithdrawal(bytes32 withdrawalId) external onlyOwner {
        PendingWithdrawal storage withdrawal = pendingWithdrawals[withdrawalId];

        require(!withdrawal.executed, "Withdrawal already executed");
        require(withdrawal.amount > 0, "Withdrawal does not exist");

        delete pendingWithdrawals[withdrawalId];
        emit WithdrawalCancelled(withdrawalId);
    }

    /**
     * @dev Emergency withdrawal to treasury (bypasses timelock, limited amount)
     * @param amount Amount to withdraw (max 10 ETH)
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner whenWithdrawalsNotFrozen {
        require(amount <= 10 ether, "Emergency withdrawal limited to 10 ETH");
        require(amount <= address(this).balance, "Insufficient balance");

        (bool success, ) = treasury.call{value: amount}("");
        require(success, "Emergency withdrawal failed");
    }

    /**
     * @dev Freeze all withdrawals (circuit breaker)
     */
    function freezeWithdrawals() external onlyOwner {
        require(!withdrawalsFrozen, "Already frozen");
        withdrawalsFrozen = true;
        emit WithdrawalsFrozen();
    }

    /**
     * @dev Unfreeze withdrawals
     */
    function unfreezeWithdrawals() external onlyOwner {
        require(withdrawalsFrozen, "Not frozen");
        withdrawalsFrozen = false;
        emit WithdrawalsUnfrozen();
    }

    /**
     * @dev Update treasury address
     * @param newTreasury New treasury address
     */
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Treasury cannot be zero address");
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    /**
     * @dev Update maximum withdrawal amount
     * @param newMaxWithdrawal New maximum withdrawal amount
     */
    function setMaxWithdrawal(uint256 newMaxWithdrawal) external onlyOwner {
        require(newMaxWithdrawal > 0, "Max withdrawal must be greater than zero");
        maxWithdrawal = newMaxWithdrawal;
        emit MaxWithdrawalUpdated(newMaxWithdrawal);
    }

    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}

    /**
     * @dev Get contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
