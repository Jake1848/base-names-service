# Changelog

All notable changes to the Base Name Service project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive security features including emergency pause, reentrancy protection, and rate limiting
- CI/CD workflows for automated testing and deployment
- Linting configuration for Solidity and JavaScript
- Post-deployment configuration scripts
- MultiSig ownership transfer scripts
- Deployment verification scripts
- Security test suite covering all critical features
- Referrer fee system with configurable percentage

### Changed
- Replaced unsafe `transfer` calls with OpenZeppelin's `Address.sendValue`
- Fixed ETHRegistrarController constructor validation logic
- Improved commitment age bounds (1 minute to 30 days)
- Added `onlyOwner` modifier to withdraw function
- Enhanced error handling throughout contracts

### Fixed
- Constructor parameter validation in ETHRegistrarController
- Missing FeeManager constructor parameter in deployment
- Grace period logic in availability checks
- Referrer fee accounting issues
- Test failures due to outdated function signatures

### Security
- Added reentrancy guards on all payable functions
- Implemented emergency pause functionality
- Added registration rate limiting to prevent spam
- Secured fee management with timelock and withdrawal limits
- Protected admin functions with proper access control

## [1.0.0] - 2024-09-26

### Added
- Initial fork from ENS v3 contracts
- Base L2 specific optimizations
- Custom pricing oracle for .base domains
- Tiered pricing system (3-char: 0.5 ETH, 4-char: 0.05 ETH, 5+: 0.005 ETH)
- Grace period (90 days) for expired domains
- Commit-reveal registration mechanism
- Bulk renewal functionality
- Reverse resolution support
- Multi-signature admin support
- Fee management system
- Registration limiter for spam prevention

### Changed
- Modified from .eth to .base domain extension
- Updated BASE_NODE calculation for .base TLD
- Optimized gas usage for Base L2
- Customized pricing structure for Base ecosystem

### Security
- Implemented secure commit-reveal pattern
- Added owner-only administrative functions
- Protected fund transfers with checks
- Validated all user inputs