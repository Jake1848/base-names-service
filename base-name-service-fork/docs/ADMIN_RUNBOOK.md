# Base Name Service Admin Operations Runbook

## Overview

This runbook covers all administrative operations for the Base Name Service in production. All operations require multisig approval and should be performed by authorized personnel only.

## Prerequisites

- Access to the multisig wallet
- Hardhat development environment
- Current deployment addresses
- Emergency contact information
- Incident response procedures

## Emergency Contacts

- **Primary Admin**: [Contact info]
- **Secondary Admin**: [Contact info]
- **Technical Lead**: [Contact info]
- **Security Team**: [Contact info]

## 1. Emergency Procedures

### 1.1 Emergency Pause

**When to Use:**
- Critical vulnerability discovered
- Unexpected behavior in registrations
- Security incident in progress
- Oracle manipulation detected

**Steps:**

1. **Immediate Response**
   ```bash
   # Connect to multisig wallet
   # Call pause() on ETHRegistrarController
   controller.pause()
   ```

2. **Notification**
   - Post on official channels immediately
   - Notify all team members
   - Update status page
   - Prepare incident communication

3. **Assessment**
   - Document the issue
   - Assess impact and scope
   - Determine fix timeline
   - Plan communication strategy

### 1.2 Emergency Unpause

**Prerequisites:**
- Issue has been resolved
- Fix has been verified
- Team consensus achieved
- Communication prepared

**Steps:**

1. **Verification**
   ```bash
   # Verify the fix on testnet first
   npm run test
   npm run deploy:testnet
   # Test the fix thoroughly
   ```

2. **Unpause**
   ```bash
   # Call unpause() on ETHRegistrarController
   controller.unpause()
   ```

3. **Monitoring**
   - Monitor contract activity closely
   - Watch for any abnormal patterns
   - Verify normal operation resumed

## 2. Fee Management Operations

### 2.1 Referrer Fee Updates

**When to Update:**
- Partner agreements change
- Fee optimization needed
- Market conditions change

**Process:**

1. **Preparation**
   ```bash
   # Check current fee
   const currentFee = await controller.referrerFeePercentage()
   console.log(`Current fee: ${currentFee/100}%`)

   # Validate new fee (max 10%)
   const newFee = 750 // 7.5%
   require(newFee <= 1000, "Fee cannot exceed 10%")
   ```

2. **Execution**
   ```bash
   # Via multisig
   await controller.setReferrerFeePercentage(newFee)
   ```

3. **Verification**
   ```bash
   # Confirm change
   const updatedFee = await controller.referrerFeePercentage()
   console.log(`Updated fee: ${updatedFee/100}%`)
   ```

### 2.2 Treasury Withdrawals

**Process Overview:**
1. Request withdrawal (24-hour timelock)
2. Wait for timelock period
3. Execute withdrawal
4. Verify transfer

**Request Withdrawal:**

```bash
# Step 1: Request withdrawal
const amount = ethers.parseEther("100") // 100 ETH
const recipient = "0x..." // Treasury address

const withdrawalId = await feeManager.requestWithdrawal(amount, recipient)
console.log(`Withdrawal requested: ${withdrawalId}`)

# Note the withdrawal ID and timestamp
const withdrawal = await feeManager.pendingWithdrawals(withdrawalId)
console.log(`Execute after: ${new Date(withdrawal.timestamp * 1000 + 24 * 60 * 60 * 1000)}`)
```

**Execute Withdrawal (after 24 hours):**

```bash
# Step 2: Execute withdrawal (after timelock)
await feeManager.executeWithdrawal(withdrawalId)
console.log("Withdrawal executed successfully")

# Verify transfer
const withdrawal = await feeManager.pendingWithdrawals(withdrawalId)
console.log(`Executed: ${withdrawal.executed}`)
```

**Cancel Withdrawal (if needed):**

```bash
# Cancel pending withdrawal
await feeManager.cancelWithdrawal(withdrawalId)
console.log("Withdrawal cancelled")
```

### 2.3 Emergency Withdrawal

**Use Only For:**
- Critical security incidents
- Immediate fund protection needed
- Limited to 10 ETH maximum

```bash
# Emergency withdrawal (bypasses timelock)
const emergencyAmount = ethers.parseEther("10") // Max 10 ETH
await feeManager.emergencyWithdraw(emergencyAmount)
```

### 2.4 Freeze/Unfreeze Withdrawals

**Freeze Withdrawals:**
```bash
# During incidents
await feeManager.freezeWithdrawals()
console.log("All withdrawals frozen")
```

**Unfreeze Withdrawals:**
```bash
# After incident resolution
await feeManager.unfreezeWithdrawals()
console.log("Withdrawals unfrozen")
```

## 3. Registration Limiter Operations

### 3.1 Update Rate Limits

**Typical Scenarios:**
- Spam attack prevention
- Network congestion management
- Special events or campaigns

```bash
# Check current limits
const currentMax = await registrationLimiter.maxRegistrationsPerWindow()
const currentWindow = await registrationLimiter.timeWindow()
console.log(`Current: ${currentMax} registrations per ${currentWindow}s`)

# Update limits
const newMax = 5 // New limit
const newWindow = 3600 // 1 hour
await registrationLimiter.setMaxRegistrations(newMax)
await registrationLimiter.setTimeWindow(newWindow)
```

### 3.2 Monitor Registration Patterns

```bash
# Check current registrations for an address
const address = "0x..."
const current = await registrationLimiter.getCurrentRegistrations(address)
console.log(`Current registrations: ${current}`)

# Check if address can register
const canRegister = await registrationLimiter.canRegister(address)
console.log(`Can register: ${canRegister}`)
```

## 4. Ownership Management

### 4.1 Transfer Ownership to Multisig

**Critical Operation - Production Deployment Only**

```bash
# Verify multisig address
const multisigAddress = "0x..." // Gnosis Safe address
console.log(`Transferring to: ${multisigAddress}`)

# Transfer ownership for all contracts
await ensRegistry.transferOwnership(multisigAddress)
await baseRegistrar.transferOwnership(multisigAddress)
await controller.transferOwnership(multisigAddress)
await registrationLimiter.transferOwnership(multisigAddress)
await feeManager.transferOwnership(multisigAddress)

# IMPORTANT: Multisig must accept ownership
console.log("Ownership transferred - multisig must accept!")
```

### 4.2 Verify Ownership

```bash
# Check ownership of all contracts
const contracts = [ensRegistry, baseRegistrar, controller, registrationLimiter, feeManager]
for (const contract of contracts) {
    const owner = await contract.owner()
    console.log(`${contract.address} owner: ${owner}`)
}
```

## 5. Monitoring and Alerts

### 5.1 Key Metrics to Monitor

**Registration Activity:**
- Registration rate (per hour/day)
- Failed registrations
- Rate limiting triggers
- Unusual registration patterns

**Financial Metrics:**
- Contract balances
- Fee collection rates
- Pending withdrawals
- Emergency withdrawal usage

**Security Metrics:**
- Pause/unpause events
- Ownership changes
- Failed transactions
- Unusual admin activity

### 5.2 Alert Thresholds

```bash
# Registration rate alerts
if (registrationsPerHour > 1000) alert("High registration rate")
if (failedRegistrations > 100) alert("High failure rate")

# Financial alerts
if (contractBalance > 1000 ether) alert("High contract balance")
if (pendingWithdrawals.length > 5) alert("Many pending withdrawals")

# Security alerts
if (pauseEvents > 0) alert("CRITICAL: Contract paused")
if (ownershipChanges > 0) alert("CRITICAL: Ownership changed")
```

## 6. Incident Response

### 6.1 Incident Classification

**Level 1 - Critical:**
- Funds at risk
- Service completely down
- Security breach

**Level 2 - High:**
- Partial service disruption
- Performance issues
- Non-critical security concerns

**Level 3 - Medium:**
- Minor issues
- Feature requests
- Documentation updates

### 6.2 Response Procedures

**Level 1 Response:**
1. Activate emergency pause immediately
2. Notify all stakeholders
3. Begin incident analysis
4. Prepare public communication
5. Document all actions

**Level 2 Response:**
1. Assess impact and urgency
2. Plan fix timeline
3. Communicate to users if needed
4. Implement fix
5. Monitor results

### 6.3 Communication Templates

**Emergency Pause Announcement:**
```
🚨 NOTICE: Base Name Service Temporarily Paused

We have temporarily paused registrations due to [REASON].

We are actively investigating and will provide updates every [FREQUENCY].

Existing domains are not affected.

Updates: [CHANNEL]
```

**Service Restoration:**
```
✅ UPDATE: Base Name Service Restored

Service has been fully restored. The issue was [BRIEF DESCRIPTION].

Timeline:
- [TIME]: Issue detected
- [TIME]: Service paused
- [TIME]: Fix implemented
- [TIME]: Service restored

Thank you for your patience.
```

## 7. Deployment Operations

### 7.1 Post-Deployment Checklist

```bash
# Run verification script
npx hardhat run scripts/verify-deployment-enhanced.js --network mainnet

# Key verifications:
# ✅ All contracts deployed
# ✅ Ownership properly set
# ✅ Controllers authorized
# ✅ Price oracle configured
# ✅ Rate limits set
# ✅ Fee manager configured
# ✅ Emergency functions working
```

### 7.2 Rollback Procedures

**Important:** Contracts are non-upgradeable. Rollback requires new deployment.

1. Deploy new contracts with fixed code
2. Pause old contracts
3. Migrate critical state if possible
4. Update frontend to use new contracts
5. Communicate migration to users

## 8. Backup and Recovery

### 8.1 Data Backup

```bash
# Export critical contract state
# - Registration records
# - ENS records
# - Pending withdrawals
# - Rate limit state

# Use subgraph or event logs for recovery
```

### 8.2 Key Management

- Store multisig recovery phrases securely
- Maintain hardware wallet backups
- Document all key holders
- Regular access reviews

## 9. Regular Maintenance

### 9.1 Weekly Tasks

- Review registration metrics
- Check contract balances
- Monitor gas usage
- Review pending withdrawals
- Update monitoring alerts

### 9.2 Monthly Tasks

- Security review
- Update documentation
- Review access controls
- Validate monitoring systems
- Test emergency procedures

### 9.3 Quarterly Tasks

- Full security audit
- Disaster recovery test
- Update contact information
- Review and update procedures
- Team training on procedures

## 10. Troubleshooting

### 10.1 Common Issues

**Registration Failures:**
- Check if contract is paused
- Verify rate limiting not hit
- Confirm sufficient funds
- Validate label format

**Withdrawal Issues:**
- Check timelock period
- Verify withdrawal not frozen
- Confirm multisig signatures
- Check recipient address

**Access Issues:**
- Verify multisig setup
- Check signer availability
- Confirm network connection
- Validate contract addresses

### 10.2 Debug Commands

```bash
# Check contract status
const paused = await controller.paused()
const frozen = await feeManager.withdrawalsFrozen()
console.log(`Paused: ${paused}, Frozen: ${frozen}`)

# Check balances
const balance = await ethers.provider.getBalance(controller.address)
console.log(`Controller balance: ${ethers.formatEther(balance)} ETH`)

# Check rate limits
const canRegister = await registrationLimiter.canRegister(address)
console.log(`Can register: ${canRegister}`)
```

---

**IMPORTANT:** Always test procedures on testnet first. Never perform operations on mainnet without proper authorization and verification.

**Security Note:** This runbook contains sensitive operational information. Restrict access to authorized personnel only.