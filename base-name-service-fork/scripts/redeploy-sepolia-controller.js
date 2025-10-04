// Redeploy BaseController with CHEAP price oracle
const { ethers } = require("hardhat");

async function main() {
    console.log("\n🔄 Redeploying BaseController with CHEAP oracle...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH\n");

    // Existing contract addresses
    const contracts = {
        BaseRegistrar: "0x69b81319958388b5133DF617Ba542FB6c9e03177",
        ReverseRegistrar: "0xa1f10499B1D1a1c249443d82aaDA9ff7F3AE99cF",
        DefaultReverseResolver: "0xF66fDE9Df83613d6F726E3bEcF97852310d1767e",
        ENSRegistry: "0x9396f642A4bDabE278D51Dad7b277Ba4151bFfAd",
        RegistrationLimiter: "0x823262c6F3283Ac4901f704769aAD39FE6888c27",
        FeeManager: "0x7b84068C4eF344bA11eF3F9D322305618Df57bBA",
        CheapPriceOracle: "0xb06803C4BBe96AA27eFB01a78C92d17ccA6106b9", // NEW!
        OldController: "0x89f676A75447604c6dE7D3887D5c43107D0E5268"
    };

    console.log("Using CHEAP TestnetPriceOracle:", contracts.CheapPriceOracle);
    console.log("(100x cheaper than mainnet!)\n");

    // Deploy new controller with cheap oracle
    console.log("1. Deploying NEW ETHRegistrarController...");
    const ETHRegistrarController = await ethers.getContractFactory("ETHRegistrarController");
    const newController = await ETHRegistrarController.deploy(
        contracts.BaseRegistrar,
        contracts.CheapPriceOracle, // Use CHEAP oracle!
        60, // minCommitmentAge
        86400, // maxCommitmentAge
        contracts.ReverseRegistrar,
        contracts.DefaultReverseResolver,
        contracts.ENSRegistry,
        contracts.RegistrationLimiter,
        contracts.FeeManager
    );
    await newController.waitForDeployment();
    const newControllerAddress = await newController.getAddress();
    console.log("✅ NEW BaseController:", newControllerAddress);

    // Remove old controller permissions
    console.log("\n2. Updating BaseRegistrar permissions...");
    const registrar = await ethers.getContractAt("BaseRegistrarImplementation", contracts.BaseRegistrar);

    // Remove old controller
    console.log("   Removing old controller...");
    try {
        const tx1 = await registrar.removeController(contracts.OldController);
        await tx1.wait();
        console.log("   ✅ Old controller removed");
    } catch (error) {
        console.log("   ⚠️  Could not remove old controller:", error.message);
    }

    // Add new controller
    console.log("   Adding new controller...");
    const tx2 = await registrar.addController(newControllerAddress);
    await tx2.wait();
    console.log("   ✅ New controller added");

    // Verify
    console.log("\n3. Verifying setup...");
    const oracle = await newController.prices();
    console.log("   Controller's oracle:", oracle);
    console.log("   Expected oracle:", contracts.CheapPriceOracle);

    if (oracle.toLowerCase() === contracts.CheapPriceOracle.toLowerCase()) {
        console.log("   ✅ SUCCESS!");
    }

    // Test prices
    console.log("\n4. Testing prices...");
    const price = await newController.rentPrice("hello", BigInt(365 * 24 * 60 * 60));
    console.log("   Price for 'hello' (5 chars, 1 year):", ethers.formatEther(price[0]), "ETH");
    console.log("   That's only ~$0.0001 USD! 🎉\n");

    // Save deployment
    const fs = require('fs');
    const deployment = {
        network: "base-sepolia",
        timestamp: new Date().toISOString(),
        oldController: contracts.OldController,
        newController: newControllerAddress,
        cheapOracle: contracts.CheapPriceOracle,
        testPrice: {
            domain: "hello",
            duration: "1 year",
            price: ethers.formatEther(price[0]) + " ETH"
        }
    };

    fs.writeFileSync('sepolia-new-controller.json', JSON.stringify(deployment, null, 2));
    console.log("💾 Saved to: sepolia-new-controller.json");

    console.log("\n🎉 COMPLETE! Sepolia now uses CHEAP pricing!");
    console.log("\n📝 Update frontend src/lib/contracts.ts:");
    console.log(`   BaseController: "${newControllerAddress}",`);
    console.log(`   BasePriceOracle: "${contracts.CheapPriceOracle}",`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
