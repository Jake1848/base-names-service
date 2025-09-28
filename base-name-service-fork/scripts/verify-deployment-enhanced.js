const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Enhanced Deployment Verification Script
 * Includes comprehensive security and configuration checks
 */

async function main() {
  console.log("🔍 Starting enhanced deployment verification...\n");

  const network = await ethers.provider.getNetwork();
  console.log(`Network: ${network.name} (chainId: ${network.chainId})\n`);

  const deploymentFile = path.join(__dirname, `../deployment-${network.name}.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ Deployment file not found: ${deploymentFile}`);
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const results = { passed: [], failed: [], warnings: [] };

  // 1. Verify contract deployments
  console.log("1️⃣ Verifying contract deployments...");
  for (const [name, address] of Object.entries(deployment.contracts || {})) {
    const code = await ethers.provider.getCode(address);
    if (code !== "0x") {
      results.passed.push(`✅ ${name}: ${address}`);
    } else {
      results.failed.push(`❌ ${name}: No code at ${address}`);
    }
  }

  // 2. Security configuration checks
  console.log("\n2️⃣ Checking security configurations...");

  try {
    // ETHRegistrarController security checks
    const controller = await ethers.getContractAt(
      "ETHRegistrarController",
      deployment.contracts.BaseController || deployment.contracts.ETHRegistrarController
    );

    // Commitment age bounds
    const minCommitmentAge = await controller.minCommitmentAge();
    const maxCommitmentAge = await controller.maxCommitmentAge();

    if (minCommitmentAge >= 60) {
      results.passed.push(`✅ Min commitment age: ${minCommitmentAge}s (≥ 1 minute)`);
    } else {
      results.failed.push(`❌ Min commitment age too low: ${minCommitmentAge}s`);
    }

    if (maxCommitmentAge <= 30 * 24 * 60 * 60) {
      results.passed.push(`✅ Max commitment age: ${maxCommitmentAge}s (≤ 30 days)`);
    } else {
      results.failed.push(`❌ Max commitment age too high: ${maxCommitmentAge}s`);
    }

    // Referrer fee check
    const referrerFee = await controller.referrerFeePercentage();
    if (referrerFee <= 1000) {
      results.passed.push(`✅ Referrer fee: ${referrerFee/100}% (≤ 10%)`);
    } else {
      results.failed.push(`❌ Referrer fee too high: ${referrerFee/100}%`);
    }

    // Emergency pause status
    const isPaused = await controller.paused();
    if (!isPaused) {
      results.passed.push("✅ Controller not paused");
    } else {
      results.warnings.push("⚠️ Controller is currently paused");
    }

    // Label validation test
    const validTests = [
      { label: "abc", expected: true },
      { label: "ABC", expected: false },
      { label: "a-b", expected: true },
      { label: "-ab", expected: false },
      { label: "ab-", expected: false },
      { label: "a--b", expected: false },
      { label: "ab", expected: false }
    ];

    let validationPassed = true;
    for (const test of validTests) {
      const isValid = await controller.valid(test.label);
      if (isValid !== test.expected) {
        validationPassed = false;
        break;
      }
    }

    if (validationPassed) {
      results.passed.push("✅ Label validation rules working correctly");
    } else {
      results.failed.push("❌ Label validation rules not working as expected");
    }

  } catch (error) {
    results.failed.push(`❌ Controller checks failed: ${error.message}`);
  }

  // 3. RegistrationLimiter checks
  console.log("\n3️⃣ Checking RegistrationLimiter...");

  if (deployment.contracts.RegistrationLimiter) {
    try {
      const limiter = await ethers.getContractAt(
        "RegistrationLimiter",
        deployment.contracts.RegistrationLimiter
      );

      const controller = await limiter.controller();
      const expectedController = deployment.contracts.BaseController || deployment.contracts.ETHRegistrarController;

      if (controller === expectedController) {
        results.passed.push("✅ RegistrationLimiter controller set correctly");
      } else {
        results.failed.push("❌ RegistrationLimiter controller not set correctly");
      }

      const maxRegs = await limiter.maxRegistrationsPerWindow();
      const window = await limiter.timeWindow();
      results.passed.push(`✅ Rate limit: ${maxRegs} per ${window}s`);

    } catch (error) {
      results.failed.push(`❌ RegistrationLimiter checks failed: ${error.message}`);
    }
  }

  // 4. FeeManager checks
  console.log("\n4️⃣ Checking FeeManager...");

  if (deployment.contracts.FeeManager) {
    try {
      const feeManager = await ethers.getContractAt(
        "FeeManager",
        deployment.contracts.FeeManager
      );

      const treasury = await feeManager.treasury();
      if (treasury !== ethers.constants.AddressZero) {
        results.passed.push(`✅ Treasury set: ${treasury}`);
      } else {
        results.failed.push("❌ Treasury not set");
      }

      const maxWithdrawal = await feeManager.maxWithdrawal();
      results.passed.push(`✅ Max withdrawal: ${ethers.utils.formatEther(maxWithdrawal)} ETH`);

      const frozen = await feeManager.withdrawalsFrozen();
      if (!frozen) {
        results.passed.push("✅ Withdrawals not frozen");
      } else {
        results.warnings.push("⚠️ Withdrawals are frozen");
      }

    } catch (error) {
      results.failed.push(`❌ FeeManager checks failed: ${error.message}`);
    }
  }

  // 5. Ownership checks
  console.log("\n5️⃣ Checking ownership...");

  const contractsToCheck = [
    "BaseRegistrar",
    "BaseController",
    "ETHRegistrarController",
    "RegistrationLimiter",
    "FeeManager"
  ];

  for (const contractName of contractsToCheck) {
    const address = deployment.contracts[contractName];
    if (address) {
      try {
        const contract = await ethers.getContractAt("Ownable", address);
        const owner = await contract.owner();

        if (owner === deployment.deployer) {
          results.warnings.push(`⚠️ ${contractName} owned by deployer (transfer to multisig)`);
        } else {
          results.passed.push(`✅ ${contractName} owned by: ${owner}`);
        }
      } catch (error) {
        // Contract might not have owner function
      }
    }
  }

  // Print results
  console.log("\n" + "=".repeat(60));
  console.log("VERIFICATION RESULTS");
  console.log("=".repeat(60));

  if (results.passed.length > 0) {
    console.log("\n✅ PASSED (" + results.passed.length + "):");
    results.passed.forEach(msg => console.log("  " + msg));
  }

  if (results.warnings.length > 0) {
    console.log("\n⚠️ WARNINGS (" + results.warnings.length + "):");
    results.warnings.forEach(msg => console.log("  " + msg));
  }

  if (results.failed.length > 0) {
    console.log("\n❌ FAILED (" + results.failed.length + "):");
    results.failed.forEach(msg => console.log("  " + msg));
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  if (results.failed.length === 0) {
    if (results.warnings.length === 0) {
      console.log("✅ All checks passed! Ready for production.");
    } else {
      console.log("⚠️ Passed with warnings. Review before mainnet.");
    }
  } else {
    console.log("❌ Verification failed. Fix issues before proceeding.");
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });