const { ethers } = require("hardhat");

async function main() {
    const [signer] = await ethers.getSigners();
    const controller = await ethers.getContractAt("ETHRegistrarController", "0xCD24477aFCB5D97B3B794a376d6a1De38e640564");
    const registrar = await ethers.getContractAt("BaseRegistrarImplementation", "0x69b81319958388b5133DF617Ba542FB6c9e03177");
    
    const domain = "test999";
    const duration = BigInt(365 * 24 * 60 * 60);
    const resolver = "0x2927556a0761d6E4A6635CBE9988747625dAe125";
    const secret = ethers.hexlify(ethers.randomBytes(32));
    
    // Check if available
    const tokenId = ethers.keccak256(ethers.toUtf8Bytes(domain));
    const available = await registrar.available(tokenId);
    console.log(`${domain}.base available:`, available);
    
    if (!available) {
        console.log("Domain not available!");
        return;
    }
    
    // Get price
    const price = await controller.rentPrice(domain, duration);
    console.log("Price:", ethers.formatEther(price.base + price.premium), "ETH");
    
    // Make commitment
    const commitment = await controller.makeCommitment(domain, signer.address, duration, secret, resolver, [], false, ethers.ZeroHash, 0);
    console.log("\n1. Committing...");
    let tx = await controller.commit(commitment);
    await tx.wait();
    console.log("✅ Committed");
    
    // Wait
    console.log("\n2. Waiting 60 seconds...");
    await new Promise(r => setTimeout(r, 60000));
    console.log("✅ Wait complete");
    
    // Register
    console.log("\n3. Registering...");
    tx = await controller.register(
        domain,
        signer.address,
        duration,
        secret,
        resolver,
        [],
        false,
        ethers.ZeroHash,
        0,
        { value: price.base + price.premium, gasLimit: 500000 }
    );
    console.log("TX:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ SUCCESS! Block:", receipt.blockNumber);
    console.log(`\n🎉 Registered ${domain}.base!`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
