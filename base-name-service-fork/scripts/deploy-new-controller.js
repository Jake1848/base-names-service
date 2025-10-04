const { ethers } = require("hardhat");
const namehash = require('eth-ens-namehash');

async function main() {
    console.log("\n🚀 Deploying new ETHRegistrarController on Base Sepolia\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with:", deployer.address);

    // Existing addresses
    const ensAddress = "0x9396f642A4bDabE278D51Dad7b277Ba4151bFfAd";
    const oldRegistrarAddress = "0x69b81319958388b5133DF617Ba542FB6c9e03177";
    const newRegistrarAddress = "0xDE42a2c46eBe0878474F1889180589393ed11841";
    const priceOracleAddress = "0x3B7d21d238D158eA760FFdB8A5B9A1c3091Bd8c5";
    const reverseRegistrarAddress = "0xa1f10499B1D1a1c249443d82aaDA9ff7F3AE99cF";
    const defaultReverseRegistrarAddress = "0xF66fDE9Df83613d6F726E3bEcF97852310d1767e";
    const registrationLimiterAddress = "0x823262c6F3283Ac4901f704769aAD39FE6888c27";
    const feeManagerAddress = "0x7b84068C4eF344bA11eF3F9D322305618Df57bBA";

    console.log("ENS Registry:", ensAddress);
    console.log("New BaseRegistrar:", newRegistrarAddress);
    console.log("Price Oracle:", priceOracleAddress);
    console.log("Reverse Registrar:", reverseRegistrarAddress);
    console.log("Default Reverse Registrar:", defaultReverseRegistrarAddress);
    console.log("Registration Limiter:", registrationLimiterAddress);
    console.log("Fee Manager:", feeManagerAddress);

    // Deploy new ETHRegistrarController
    console.log("\n1. Deploying ETHRegistrarController...");
    const Controller = await ethers.getContractFactory("ETHRegistrarController");

    const controller = await Controller.deploy(
        newRegistrarAddress,  // Use NEW registrar
        priceOracleAddress,
        60,  // minCommitmentAge (60 seconds)
        86400,  // maxCommitmentAge (1 day)
        reverseRegistrarAddress,
        defaultReverseRegistrarAddress,
        ensAddress,
        registrationLimiterAddress,
        feeManagerAddress
    );

    await controller.waitForDeployment();
    const controllerAddress = await controller.getAddress();
    console.log("✅ ETHRegistrarController deployed to:", controllerAddress);

    // 2. Add controller to new registrar
    console.log("\n2. Adding controller to new registrar...");
    const registrar = await ethers.getContractAt(
        "BaseRegistrarImplementation",
        newRegistrarAddress
    );
    const tx1 = await registrar.addController(controllerAddress);
    await tx1.wait();
    console.log("✅ Controller added to new registrar");

    // 3. Approve controller in ENS Registry
    console.log("\n3. Approving controller in ENS Registry...");
    const tx2 = await registrar.approveOperatorInENS(controllerAddress, true);
    await tx2.wait();
    console.log("✅ Controller approved in ENS Registry!");

    // 4. Verify approval
    console.log("\n4. Verifying approval...");
    const ensCheckAbi = ["function isApprovedForAll(address owner, address operator) view returns (bool)"];
    const ens = await ethers.getContractAt(ensCheckAbi, ensAddress);
    const isApproved = await ens.isApprovedForAll(newRegistrarAddress, controllerAddress);
    console.log("Controller approved:", isApproved);

    if (isApproved) {
        console.log("\n🎉 SUCCESS! New controller deployed and configured!");
        console.log("\n📋 Addresses to update in frontend:");
        console.log("BaseRegistrar:", newRegistrarAddress);
        console.log("BaseController:", controllerAddress);
        console.log("\nENSRegistry:", ensAddress);
        console.log("PublicResolver:", "0x2927556a0761d6E4A6635CBE9988747625dAe125");
        console.log("ReverseRegistrar:", reverseRegistrarAddress);
        console.log("PriceOracle:", priceOracleAddress);
    } else {
        console.log("\n❌ Approval verification failed");
    }
}

main().catch(console.error);
