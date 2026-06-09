# Web3 Test Suite 🔐

[![Web3 Test Suite](https://github.com/thedorCode-star/web3-test-suite/actions/workflows/test.yml/badge.svg)](https://github.com/thedorCode-star/web3-test-suite/actions/workflows/test.yml)

## 🎯 43 Passing Tests

Complete test suite for DeFi lending protocol and ERC-20 token functionality.

## 📊 Test Coverage

| Category | Tests |
|----------|-------|
| Lending Protocol | Deposit, Borrow, Health Factor, Repay, Withdraw |
| Token (ERC-20) | Transfer, Mint, Burn, Allowances |
| **Total** | **43 passing** |

## 🚀 What I Tested

### Lending Protocol (DeFi)
- ✅ Deposit ETH as collateral
- ✅ Borrow up to 50% of collateral
- ✅ Health factor calculation
- ✅ Repay loans
- ✅ Withdraw collateral (no debt required)

### Token Contract
- ✅ Token transfers between accounts
- ✅ Minting (only owner)
- ✅ Burning tokens
- ✅ Approvals and transferFrom

## 🛠️ Tech Stack

- Hardhat (Testing framework)
- Ethers.js (Blockchain interaction)
- Chai (Assertions)
- Solidity (Smart contracts)
- GitHub Actions (CI/CD)

## 📈 CI/CD

Every push to main/master automatically runs all 43 tests.

![Test Results](./test-results.png)

## 🔗 Connect With Me

[GitHub](https://github.com/thedorCode-star) | [LinkedIn](https://linkedin.com/in/tkazadi10)