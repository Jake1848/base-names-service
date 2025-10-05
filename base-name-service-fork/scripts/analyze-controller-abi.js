const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const controllerAddress = "0xCD24477aFCB5D97B3B794a376d6a1De38e640564";

    console.log("\n🔍 Analyzing Controller Contract\n");
    
    // Try to get the code
    const code = await provider.getCode(controllerAddress);
    console.log("Contract has code:", code !== "0x" ? "✅ Yes" : "❌ No");
    console.log("Code length:", code.length, "bytes");
    console.log("");

    // Let's try calling the register function directly and see what error we get
    console.log("Testing direct register() call to see exact revert reason...");
    
    const label = "jake";
    const owner = "0xF1Ec8EB4d825A4f739425bF86957f3AE4b00A0BC";
    const duration = 31536000;
    const secret = "0x73bf88e8c4f8c18b8c4f8c18b8c4f8c18b8c4f8c18b8c4f8c18b8c4f8c18b8c4";
    const resolver = "0x0000000000000000000000000000000000000000";
    const data = [];
    const reverseRecord = false;
    const referrer = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const fuses = 0;

    const registerAbi = [
        "function register(string label, address owner, uint256 duration, bytes32 secret, address resolver, bytes[] data, bool reverseRecord, bytes32 referrer, uint256 fuses) payable"
    ];

    const controller = new ethers.Contract(controllerAddress, registerAbi, provider);

    try {
        await controller.register.staticCall(
            label, owner, duration, secret, resolver, data, reverseRecord, referrer, fuses,
            { value: ethers.parseEther("0.001") }
        );
        console.log("✅ Register call succeeded!");
    } catch (error) {
        console.log("❌ Register call failed:");
        console.log("   Message:", error.message);
        
        // Try to decode the error
        if (error.data) {
            console.log("   Error data:", error.data);
        }
    }
}

main().catch(console.error);
