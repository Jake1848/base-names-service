// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title DomainStaking
 * @dev Stake .base domains to earn rewards
 * @notice Users can stake their domains to earn BNS tokens
 */
contract DomainStaking is Ownable, ReentrancyGuard, Pausable {
    IERC721 public immutable baseRegistrar;

    struct StakeInfo {
        uint256 tokenId;
        address owner;
        uint256 stakedAt;
        uint256 lastClaimAt;
        uint256 accumulatedRewards;
        bool active;
    }

    struct PoolConfig {
        uint256 rewardRate; // Rewards per second per staked domain
        uint256 minimumStakePeriod; // Minimum time to stake before unstaking
        uint256 bonusMultiplier; // Bonus for long-term staking (in basis points)
        uint256 bonusThreshold; // Time threshold for bonus (in seconds)
    }

    mapping(uint256 => StakeInfo) public stakes;
    mapping(address => uint256[]) public userStakes;

    PoolConfig public config;
    uint256 public totalStaked;
    uint256 public totalRewardsClaimed;
    uint256 public rewardPool;

    event Staked(address indexed user, uint256 indexed tokenId, uint256 timestamp);
    event Unstaked(address indexed user, uint256 indexed tokenId, uint256 timestamp);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardPoolFunded(uint256 amount);
    event ConfigUpdated(uint256 rewardRate, uint256 minimumStakePeriod, uint256 bonusMultiplier);

    constructor(address _baseRegistrar) {
        require(_baseRegistrar != address(0), "Invalid registrar address");
        baseRegistrar = IERC721(_baseRegistrar);

        // Default configuration
        config = PoolConfig({
            rewardRate: 1e15, // 0.001 ETH per second (example)
            minimumStakePeriod: 7 days,
            bonusMultiplier: 5000, // 50% bonus
            bonusThreshold: 90 days // 3 months for bonus
        });
    }

    /**
     * @dev Stake a domain to earn rewards
     * @param tokenId The domain token ID to stake
     */
    function stake(uint256 tokenId) external nonReentrant whenNotPaused {
        require(baseRegistrar.ownerOf(tokenId) == msg.sender, "Not domain owner");
        require(!stakes[tokenId].active, "Domain already staked");

        // CHECKS-EFFECTS-INTERACTIONS: Update state BEFORE external call
        stakes[tokenId] = StakeInfo({
            tokenId: tokenId,
            owner: msg.sender,
            stakedAt: block.timestamp,
            lastClaimAt: block.timestamp,
            accumulatedRewards: 0,
            active: true
        });

        userStakes[msg.sender].push(tokenId);
        totalStaked++;

        // External interaction comes AFTER state changes
        baseRegistrar.transferFrom(msg.sender, address(this), tokenId);

        emit Staked(msg.sender, tokenId, block.timestamp);
    }

    /**
     * @dev Unstake a domain and claim rewards
     * @param tokenId The domain token ID to unstake
     */
    function unstake(uint256 tokenId) external nonReentrant {
        StakeInfo storage stakeInfo = stakes[tokenId];
        require(stakeInfo.active, "Domain not staked");
        require(stakeInfo.owner == msg.sender, "Not stake owner");
        require(
            block.timestamp >= stakeInfo.stakedAt + config.minimumStakePeriod,
            "Minimum stake period not met"
        );

        // Calculate rewards amount
        uint256 rewards = _calculateRewards(tokenId);

        // CHECKS-EFFECTS-INTERACTIONS: Update state BEFORE external calls
        stakeInfo.active = false;
        totalStaked--;

        // Update claim tracking if claiming rewards
        if (rewards > 0) {
            stakeInfo.lastClaimAt = block.timestamp;
            stakeInfo.accumulatedRewards += rewards;
            totalRewardsClaimed += rewards;
            rewardPool -= rewards;
        }

        // Remove from user stakes array
        _removeUserStake(msg.sender, tokenId);

        // External interactions come AFTER state changes
        // Return domain to owner
        baseRegistrar.transferFrom(address(this), msg.sender, tokenId);

        // Transfer rewards if any
        if (rewards > 0) {
            (bool success, ) = payable(msg.sender).call{value: rewards}("");
            require(success, "Reward transfer failed");
            emit RewardsClaimed(msg.sender, rewards);
        }

        emit Unstaked(msg.sender, tokenId, block.timestamp);
    }

    /**
     * @dev Claim accumulated rewards without unstaking
     * @param tokenId The domain token ID
     */
    function claimRewards(uint256 tokenId) external nonReentrant {
        StakeInfo storage stakeInfo = stakes[tokenId];
        require(stakeInfo.active, "Domain not staked");
        require(stakeInfo.owner == msg.sender, "Not stake owner");

        uint256 rewards = _calculateRewards(tokenId);
        require(rewards > 0, "No rewards to claim");
        require(rewardPool >= rewards, "Insufficient reward pool");

        // CHECKS-EFFECTS-INTERACTIONS: Update state BEFORE external call
        stakeInfo.lastClaimAt = block.timestamp;
        stakeInfo.accumulatedRewards += rewards;
        totalRewardsClaimed += rewards;
        rewardPool -= rewards;

        // External interaction comes AFTER state changes
        (bool success, ) = payable(msg.sender).call{value: rewards}("");
        require(success, "Reward transfer failed");

        emit RewardsClaimed(msg.sender, rewards);
    }

    /**
     * @dev Calculate pending rewards for a staked domain
     * @param tokenId The domain token ID
     * @return uint256 The pending rewards amount
     */
    function calculatePendingRewards(uint256 tokenId) external view returns (uint256) {
        if (!stakes[tokenId].active) return 0;
        return _calculateRewards(tokenId);
    }

    /**
     * @dev Get all stakes for a user
     * @param user The user address
     * @return uint256[] Array of staked token IDs
     */
    function getUserStakes(address user) external view returns (uint256[] memory) {
        return userStakes[user];
    }

    /**
     * @dev Get detailed stake information
     * @param tokenId The domain token ID
     * @return StakeInfo The stake information
     */
    function getStakeInfo(uint256 tokenId) external view returns (StakeInfo memory) {
        return stakes[tokenId];
    }

    /**
     * @dev Internal function to calculate rewards
     * @param tokenId The domain token ID
     * @return uint256 The calculated rewards
     */
    function _calculateRewards(uint256 tokenId) internal view returns (uint256) {
        StakeInfo storage stakeInfo = stakes[tokenId];
        if (!stakeInfo.active) return 0;

        uint256 stakeDuration = block.timestamp - stakeInfo.lastClaimAt;
        uint256 baseReward = stakeDuration * config.rewardRate;

        // Apply bonus if staked long enough
        uint256 totalStakeDuration = block.timestamp - stakeInfo.stakedAt;
        if (totalStakeDuration >= config.bonusThreshold) {
            baseReward = baseReward + (baseReward * config.bonusMultiplier) / 10000;
        }

        return baseReward;
    }


    /**
     * @dev Remove token ID from user's stake array
     * @param user The user address
     * @param tokenId The token ID to remove
     */
    function _removeUserStake(address user, uint256 tokenId) internal {
        uint256[] storage userTokens = userStakes[user];
        for (uint256 i = 0; i < userTokens.length; i++) {
            if (userTokens[i] == tokenId) {
                userTokens[i] = userTokens[userTokens.length - 1];
                userTokens.pop();
                break;
            }
        }
    }

    /**
     * @dev Fund the reward pool (owner only)
     */
    function fundRewardPool() external payable onlyOwner {
        require(msg.value > 0, "Must send ETH");
        rewardPool += msg.value;
        emit RewardPoolFunded(msg.value);
    }

    /**
     * @dev Update staking configuration (owner only)
     * @param _rewardRate New reward rate
     * @param _minimumStakePeriod New minimum stake period
     * @param _bonusMultiplier New bonus multiplier
     * @param _bonusThreshold New bonus threshold
     */
    function updateConfig(
        uint256 _rewardRate,
        uint256 _minimumStakePeriod,
        uint256 _bonusMultiplier,
        uint256 _bonusThreshold
    ) external onlyOwner {
        require(_bonusMultiplier <= 10000, "Bonus too high"); // Max 100%
        require(_minimumStakePeriod <= 365 days, "Period too long");

        config.rewardRate = _rewardRate;
        config.minimumStakePeriod = _minimumStakePeriod;
        config.bonusMultiplier = _bonusMultiplier;
        config.bonusThreshold = _bonusThreshold;

        emit ConfigUpdated(_rewardRate, _minimumStakePeriod, _bonusMultiplier);
    }

    /**
     * @dev Pause staking operations (owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause staking operations (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency withdraw of unclaimed rewards (owner only)
     * @param amount The amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(amount <= rewardPool, "Amount exceeds pool");
        rewardPool -= amount;
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Receive ETH for reward pool
     */
    receive() external payable {
        rewardPool += msg.value;
        emit RewardPoolFunded(msg.value);
    }
}
