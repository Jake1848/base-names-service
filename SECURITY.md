# Security Policy

## Overview

The Base Name Service (BNS) takes security seriously. This document outlines our security practices, vulnerability disclosure process, and bug bounty program.

## Supported Versions

We actively maintain security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Features

### Smart Contract Security

- **Commit-Reveal Pattern**: Prevents front-running attacks during domain registration
- **Grace Period**: 90-day grace period for domain renewals
- **Emergency Pause**: Circuit breaker for critical incident response
- **Rate Limiting**: Per-address registration limits to prevent abuse
- **Withdrawal Timelock**: 24-hour delay for treasury withdrawals
- **Non-Reentrancy Guards**: Protection against reentrancy attacks
- **Safe Transfer Methods**: Using OpenZeppelin's Address.sendValue() for ETH transfers

### Validation & Normalization

- **Label Validation**: Strict ASCII-only character set (a-z, 0-9, hyphen)
- **Length Requirements**: Minimum 3 characters for domain names
- **Hyphen Rules**: No leading/trailing or consecutive hyphens
- **Commitment Bounds**: Enforced min/max commitment ages (1 minute to 30 days)

### Administrative Controls

- **Multisig Ownership**: All admin functions require multisig approval
- **Fee Limits**: Maximum 10% referrer fee, 10 ETH emergency withdrawal limit
- **Event Logging**: Comprehensive events for all admin actions
- **Circuit Breakers**: Ability to freeze withdrawals in emergencies

## Bug Bounty Program

### Scope

The bug bounty program covers:

- All smart contracts in `/base-name-service-fork/contracts/`
- Excluding:
  - Test contracts in `/test/` and `/mocks/`
  - Third-party dependencies (OpenZeppelin, etc.)
  - Already reported vulnerabilities

### Severity Levels & Rewards

| Severity | Description | Reward (USD) |
| -------- | ----------- | ------------ |
| Critical | Direct theft of funds, permanent freezing of funds, unauthorized minting | $10,000 - $50,000 |
| High | Temporary freezing of funds, griefing attacks with significant impact | $5,000 - $10,000 |
| Medium | Griefing attacks with moderate impact, gas optimization issues > 20% | $1,000 - $5,000 |
| Low | Issues with minimal impact, gas optimizations < 20% | $100 - $1,000 |

### Reporting Process

1. **DO NOT** disclose vulnerabilities publicly
2. Send detailed reports to: security@basename.service (placeholder - update with actual email)
3. Include:
   - Vulnerability description
   - Impact assessment
   - Steps to reproduce
   - Suggested fix (optional)
   - Your contact information

### Response Timeline

- **Initial Response**: Within 24 hours
- **Severity Assessment**: Within 72 hours
- **Fix Timeline**: Based on severity (Critical: 7 days, High: 14 days, Medium/Low: 30 days)
- **Bounty Payment**: Within 30 days of fix deployment

## Security Audits

### Completed Audits

- Internal security review completed (Date: TBD)
- Slither static analysis integrated in CI/CD

### Planned Audits

- [ ] Professional third-party audit before mainnet deployment
- [ ] Formal verification of critical functions
- [ ] Economic security analysis

## Known Issues

### Acknowledged Risks

1. **Normalization Policy**: Currently enforces on-chain ASCII validation. Unicode normalization handled off-chain.
2. **Upgrade Strategy**: Contracts are non-upgradeable by design. Migration would require new deployment.
3. **Centralization**: Initial deployment uses EOA ownership, should be transferred to multisig immediately.

## Security Checklist

### Pre-Deployment

- [ ] All tests passing with >95% coverage
- [ ] Slither analysis shows no high/critical issues
- [ ] Deployment scripts tested on testnet
- [ ] Multisig wallet deployed and tested
- [ ] Emergency response procedures documented

### Post-Deployment

- [ ] Ownership transferred to multisig
- [ ] Emergency pause tested
- [ ] Monitoring alerts configured
- [ ] Incident response team designated
- [ ] Bug bounty program active

## Contact

For security concerns, please contact:
- Email: security@basename.service (placeholder - update with actual email)
- Encrypted communication: [PGP Key](link-to-pgp-key)

For general questions:
- GitHub Issues: https://github.com/your-org/base-name-service/issues

## Incident Response

In case of a security incident:

1. **Detection**: Monitoring alerts or user reports
2. **Assessment**: Evaluate severity and impact
3. **Containment**: Activate emergency pause if needed
4. **Communication**: Notify users via official channels
5. **Resolution**: Deploy fixes following timelock procedures
6. **Post-Mortem**: Publish incident report

## Responsible Disclosure

We appreciate security researchers who follow responsible disclosure:

1. Allow reasonable time for fixes before public disclosure
2. Do not exploit vulnerabilities beyond proof of concept
3. Do not access or modify user data
4. Work with us to ensure fixes are complete

Thank you for helping keep the Base Name Service secure!