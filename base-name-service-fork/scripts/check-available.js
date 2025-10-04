const { ethers } = require("hardhat");

async function main() {
    const registrar = await ethers.getContractAt(
        "BaseRegistrarImplementation",
        "0x69b81319958388b5133DF617Ba542FB6c9e03177"
    );
    
    const domains = ["jake", "test123", "hello", "myname"];
    
    for (const domain of domains) {
        const tokenId = ethers.keccak256(ethers.toUtf8Bytes(domain));
        const available = await registrar.available(tokenId);
        console.log(`${domain}.base:`, available ? "✅ Available" : "❌ Taken");
    }
}

main().catch(console.error);
