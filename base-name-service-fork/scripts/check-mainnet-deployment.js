const { ethers } = require("hardhat");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    
    const contracts = {
        ENSRegistry: "0x5f0C3a1d7B285262cce8D8716bf9718feA6D0f9E",
        BaseRegistrar: "0xD158de26c787ABD1E0f2955C442fea9d4DC0a917",
        BaseController: "0xca7FD90f4C76FbCdbdBB3427804374b16058F55e",
        PublicResolver: "0x5D5bC53bDa5105561371FEf50B50E03aA94c962E",
        ReverseRegistrar: "0xD982f3bFf21dCb9421ffBC2000Cfe3C94A01c889",
        BasePriceOracle: "0xA1805458A1C1294D53eBBBd025B397F89Dd963AC"
    };
    
    console.log("\n🔍 Checking Base Mainnet Deployment...\n");
    
    for (const [name, address] of Object.entries(contracts)) {
        const code = await provider.getCode(address);
        const status = code !== "0x" ? "✅ DEPLOYED" : "❌ NOT DEPLOYED";
        console.log(`${status} - ${name}: ${address}`);
    }
}

main().catch(console.error);
