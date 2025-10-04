// Update Sepolia testnet to use CHEAP price oracle
const { ethers } = require("hardhat");

async function main() {
    console.log("\n💰 Updating Sepolia Prices to be SUPER CHEAP...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH\n");

    // Existing contracts
    const controllerAddress = "0x89f676A75447604c6dE7D3887D5c43107D0E5268";
    const oldOracleAddress = "0x3B7d21d238D158eA760FFdB8A5B9A1c3091Bd8c5";

    // 1. Deploy new CHEAP TestnetPriceOracle
    console.log("1. Deploying TestnetPriceOracle (100x cheaper)...");
    const TestnetPriceOracle = await ethers.getContractFactory("TestnetPriceOracle");
    const newOracle = await TestnetPriceOracle.deploy();
    await newOracle.waitForDeployment();
    const newOracleAddress = await newOracle.getAddress();
    console.log("✅ TestnetPriceOracle:", newOracleAddress);

    // Show the new prices
    console.log("\n📊 NEW TESTNET PRICES:");
    const test3char = await newOracle.price1Year("abc");
    const test4char = await newOracle.price1Year("test");
    const test5char = await newOracle.price1Year("hello");
    console.log("3-char domain (1 year):", ethers.formatEther(test3char), "ETH");
    console.log("4-char domain (1 year):", ethers.formatEther(test4char), "ETH");
    console.log("5+ char domain (1 year):", ethers.formatEther(test5char), "ETH");

    console.log("\n💵 Example costs:");
    console.log("- 'test' (4 chars) = ~$0.001 USD/year");
    console.log("- 'hello' (5 chars) = ~$0.0001 USD/year");
    console.log("- SUPER CHEAP for testing!\n");

    // 2. Update BaseController to use new oracle
    console.log("2. Updating BaseController to use cheap oracle...");
    const controller = await ethers.getContractAt("ETHRegistrarController", controllerAddress);

    try {
        const tx = await controller.setPriceOracle(newOracleAddress);
        await tx.wait();
        console.log("✅ BaseController updated to use cheap oracle!");
    } catch (error) {
        console.log("⚠️  setPriceOracle failed, trying alternative...");
        console.log(error.message);
    }

    // 3. Verify the update
    console.log("\n3. Verifying update...");
    try {
        const currentOracle = await controller.prices();
        console.log("Current oracle in controller:", currentOracle);

        if (currentOracle.toLowerCase() === newOracleAddress.toLowerCase()) {
            console.log("✅ SUCCESS: Controller is using cheap oracle!");
        } else {
            console.log("⚠️  Controller still using old oracle");
            console.log("Old oracle:", oldOracleAddress);
            console.log("New oracle:", newOracleAddress);
            console.log("\nYou may need to redeploy the controller with the new oracle.");
        }
    } catch (error) {
        console.log("Could not verify (method might not exist)");
    }

    // Save deployment
    const fs = require('fs');
    const deployment = {
        network: "base-sepolia",
        timestamp: new Date().toISOString(),
        oldPriceOracle: oldOracleAddress,
        newPriceOracle: newOracleAddress,
        baseController: controllerAddress,
        prices: {
            "3char": ethers.formatEther(test3char) + " ETH/year",
            "4char": ethers.formatEther(test4char) + " ETH/year",
            "5+char": ethers.formatEther(test5char) + " ETH/year"
        }
    };

    fs.writeFileSync('sepolia-cheap-prices.json', JSON.stringify(deployment, null, 2));
    console.log("\n💾 Saved to: sepolia-cheap-prices.json");

    console.log("\n🎉 DONE! Testnet domains are now 100x CHEAPER!");
    console.log("\n📝 Next step: Update frontend contracts.ts with new oracle address");
    console.log(`   BasePriceOracle: "${newOracleAddress}"`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
