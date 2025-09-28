# Base Name Service - Production Deployment Guide

## Overview

This is the authoritative guide for deploying Base Name Service to mainnet. The system is a complete ENS fork optimized for Base chain with enhanced security features.

## ✅ Pre-Deployment Checklist

### Code Quality & Security
- [x] All contracts compile successfully
- [x] Test suite passes (67/67 tests)
- [x] Slither static analysis configured and passing
- [x] Critical security issues resolved:
  - [x] Commitment age bounds properly enforced (1 min - 30 days)
  - [x] Safe ETH transfers using Address.sendValue()
  - [x] Label validation prevents homograph attacks
  - [x] Rate limiting with pre-checks
  - [x] Circuit breakers in FeeManager
- [x] Edge cases thoroughly tested
- [x] Withdrawal functions working correctly

### Documentation
- [x] SECURITY.md with bug bounty program
- [x] Validation policy documented
- [x] Admin runbooks created
- [x] Deployment verification scripts ready

### Infrastructure
- [x] CI/CD pipelines hardened
- [x] GitHub Actions pinned by SHA
- [x] Slither made gating for main branch
- [x] Deployment workflows configured

## 🏗️ Architecture Overview

### Core Contracts

| Contract | Purpose | Security Features |
|----------|---------|-------------------|
| **ENSRegistry** | Root namespace registry | Ownership controls |
| **BaseRegistrarImplementation** | .base TLD registrar | Grace period, controllers |
| **ETHRegistrarController** | Registration logic | Commit-reveal, pause, rate limiting |
| **PublicResolver** | Record resolution | Multicall, interface support |
| **ReverseRegistrar** | Reverse DNS | addr.reverse management |
| **BasePriceOracle** | Pricing tiers | 0.5/0.05/0.005 ETH/year |
| **RegistrationLimiter** | Anti-spam protection | Per-address rate limits |
| **FeeManager** | Treasury management | Timelock, emergency controls |

### Security Features

1. **Commit-Reveal Registration**: Prevents front-running
2. **Emergency Pause**: Circuit breaker for incidents
3. **Rate Limiting**: Prevents spam registrations
4. **Safe Transfers**: No reentrancy vulnerabilities
5. **Strict Validation**: ASCII-only labels
6. **Timelock Withdrawals**: 24-hour delay for treasury
7. **Circuit Breakers**: Can freeze withdrawals

## 🚀 Deployment Process

### Step 1: Environment Setup

```bash
# Clone and setup
git clone <repository>
cd base-name-service-fork
npm install

# Configure environment
cp .env.example .env
# Fill in DEPLOYER_PRIVATE_KEY, ETHERSCAN_API_KEY, etc.
```

### Step 2: Testnet Deployment

```bash
# Deploy to testnet first
npm run deploy:sepolia

# Verify deployment
npx hardhat run scripts/verify-deployment-enhanced.js --network sepolia

# Test registration flow
npx hardhat run scripts/register-name.js --network sepolia
```

### Step 3: Mainnet Deployment

```bash
# Final security checks
npm run compile
npm test
npm run lint:sol

# Deploy to mainnet
npm run deploy:mainnet

# Immediate verification
npx hardhat run scripts/verify-deployment-enhanced.js --network mainnet
```

### Step 4: Post-Deployment Configuration

```bash
# Transfer ownership to multisig
npx hardhat run scripts/transfer-to-multisig.js --network mainnet

# Verify ownership transfer
npx hardhat run scripts/verify-ownership.js --network mainnet
```

## ⚙️ Configuration Parameters

### ETHRegistrarController
- **Min Commitment Age**: 60 seconds (1 minute)
- **Max Commitment Age**: 2,592,000 seconds (30 days)
- **Min Registration Duration**: 2,419,200 seconds (28 days)
- **Referrer Fee**: 5% (500 basis points, max 10%)

### RegistrationLimiter
- **Max Registrations**: 10 per window
- **Time Window**: 3600 seconds (1 hour)

### FeeManager
- **Withdrawal Delay**: 86,400 seconds (24 hours)
- **Max Withdrawal**: 100 ETH
- **Emergency Limit**: 10 ETH

### BasePriceOracle
- **3-char domains**: 0.5 ETH/year
- **4-char domains**: 0.05 ETH/year
- **5+ char domains**: 0.005 ETH/year

## 🔐 Security Configuration

### Validation Rules

**Allowed Characters:**
- Lowercase letters: `a-z`
- Numbers: `0-9`
- Hyphens: `-` (not at start/end, no consecutive)

**Minimum Length:** 3 characters

**Examples:**
- ✅ `alice`, `bob123`, `my-domain`
- ❌ `ab`, `Alice`, `test@`, `-test`, `test--`

### Access Controls

**Ownership Hierarchy:**
1. **Deployer** → **Multisig** (transfer required)
2. **Multisig** controls all admin functions
3. **Emergency functions** still require multisig

**Critical Functions:**
- Pause/unpause registration
- Withdraw treasury funds
- Update referrer fees
- Modify rate limits

## 📊 Monitoring & Alerts

### Key Metrics

**Registration Activity:**
- Registrations per hour/day
- Failed registration rate
- Rate limiting triggers
- Revenue generation

**Security Events:**
- Emergency pause activations
- Withdrawal requests/executions
- Ownership changes
- Failed admin transactions

**System Health:**
- Contract balances
- Gas usage patterns
- Oracle price updates
- Resolver query volume

### Alert Thresholds

```javascript
// Critical alerts
if (contractPaused) alert("CRITICAL: Service paused")
if (ownershipChanged) alert("CRITICAL: Ownership transferred")
if (emergencyWithdrawal) alert("CRITICAL: Emergency withdrawal executed")

// Operational alerts
if (registrationsPerHour > 1000) alert("High registration volume")
if (failureRate > 10%) alert("High failure rate")
if (contractBalance > 1000 ether) alert("High contract balance")
```

## 🛠️ Operational Procedures

### Regular Operations

**Daily:**
- Monitor registration activity
- Check system health metrics
- Review failed transactions

**Weekly:**
- Process treasury withdrawals
- Review security alerts
- Update monitoring dashboards

**Monthly:**
- Security review
- Documentation updates
- Disaster recovery testing

### Emergency Procedures

**Incident Response:**
1. Assess severity and impact
2. Activate emergency pause if needed
3. Notify stakeholders immediately
4. Begin incident analysis
5. Implement fix and restore service

**Communication Template:**
```
🚨 NOTICE: Base Name Service Update

We are addressing [ISSUE] and have temporarily paused new registrations.

Existing domains remain unaffected.

Expected resolution: [TIMEFRAME]
Updates: [COMMUNICATION_CHANNEL]
```

## 🧪 Testing Strategy

### Automated Testing

**Unit Tests:**
- 67 tests covering all functionality
- Edge cases and security scenarios
- Gas optimization validation

**Integration Tests:**
- End-to-end registration flow
- Cross-contract interactions
- Event emission verification

**Security Tests:**
- Reentrancy protection
- Access control enforcement
- Input validation

### Manual Testing

**Pre-deployment:**
- Full registration flow on testnet
- Admin function testing
- Emergency procedure validation

**Post-deployment:**
- First mainnet registration
- Ownership transfer verification
- Monitoring system activation

## 📈 Performance Considerations

### Gas Optimization

**Registration Gas Cost:**
- Simple registration: ~200,000 gas
- With resolver setup: ~300,000 gas
- Bulk operations available

**Contract Sizes:**
- All contracts under size limit
- Optimized for frequent operations
- Minimal external dependencies

### Scalability

**Rate Limiting:**
- Configurable per requirements
- Prevents network congestion
- Maintains service quality

**Caching Strategy:**
- Resolver records cached
- Validation results cacheable
- Frontend optimization friendly

## 🔧 Troubleshooting

### Common Issues

**Registration Failures:**
1. Check if service is paused
2. Verify label validation rules
3. Confirm rate limits not exceeded
4. Validate sufficient payment

**Admin Function Failures:**
1. Verify multisig configuration
2. Check signer availability
3. Confirm network connectivity
4. Validate function parameters

### Debug Commands

```bash
# Check service status
npx hardhat run scripts/check-status.js --network mainnet

# Verify configuration
npx hardhat run scripts/verify-config.js --network mainnet

# Test registration
npx hardhat run scripts/test-registration.js --network mainnet
```

## 📋 Launch Checklist

### Pre-Launch (T-24h)
- [ ] Final code review completed
- [ ] All tests passing
- [ ] Testnet deployment verified
- [ ] Monitoring systems ready
- [ ] Team briefed on procedures

### Launch Day (T-0)
- [ ] Mainnet deployment executed
- [ ] Ownership transferred to multisig
- [ ] First test registration completed
- [ ] Monitoring alerts confirmed active
- [ ] Public announcement prepared

### Post-Launch (T+24h)
- [ ] Registration metrics reviewed
- [ ] System performance validated
- [ ] User feedback collected
- [ ] Documentation updated
- [ ] Success metrics achieved

## 🎯 Success Metrics

### Technical KPIs
- **Uptime**: >99.9%
- **Registration Success Rate**: >95%
- **Response Time**: <5 seconds
- **Gas Efficiency**: <300k gas per registration

### Business KPIs
- **Registrations**: Target volume achieved
- **Revenue**: Fee collection working
- **Security**: Zero critical incidents
- **User Satisfaction**: Positive feedback

## 📞 Support & Escalation

### Contact Information

**Level 1 - Operations:**
- Monitoring alerts
- Routine maintenance
- User support

**Level 2 - Engineering:**
- System issues
- Performance problems
- Configuration changes

**Level 3 - Security:**
- Critical incidents
- Emergency response
- Security breaches

### Escalation Matrix

| Severity | Response Time | Team | Actions |
|----------|---------------|------|---------|
| Critical | 15 minutes | Security + Engineering | Emergency pause, incident response |
| High | 1 hour | Engineering | Analysis, fix planning |
| Medium | 4 hours | Operations | Standard resolution |
| Low | 24 hours | Operations | Scheduled fix |

---

## 🎉 Deployment Status: READY FOR PRODUCTION

✅ **All critical issues resolved**
✅ **Security measures implemented**
✅ **Documentation complete**
✅ **Testing comprehensive**
✅ **Monitoring prepared**

The Base Name Service is ready for mainnet deployment. All security audits have been addressed, critical functionality has been tested, and operational procedures are in place.

**Next Steps:**
1. Schedule mainnet deployment
2. Execute deployment checklist
3. Monitor initial operations
4. Collect user feedback
5. Plan future enhancements

**Deployment Approval:** Pending stakeholder sign-off