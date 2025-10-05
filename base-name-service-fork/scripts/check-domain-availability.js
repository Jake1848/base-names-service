const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");

    const registrarAddress = "0x69b81319958388b5133DF617Ba542FB6c9e03177";
    const label = "jake";
    
    // Calculate tokenId (keccak256 of label)
    const tokenId = ethers.keccak256(ethers.toUtf8Bytes(label));

    console.log("\n🔍 Checking Domain Availability\n");
    console.log("Label:", label);
    console.log("TokenId:", tokenId);
    console.log("Registrar:", registrarAddress);
    console.log("");

    const registrarAbi = [
        "function available(uint256 id) view returns (bool)",
        "function ownerOf(uint256 tokenId) view returns (address)"
    ];

    const registrar = new ethers.Contract(registrarAddress, registrarAbi, provider);

    try {
        const isAvailable = await registrar.available(tokenId);
        console.log("Available:", isAvailable);

        if (!isAvailable) {
            console.log("❌ Domain is NOT available!");
            try {
                const owner = await registrar.ownerOf(tokenId);
                console.log("Current owner:", owner);
            } catch (e) {
                console.log("Could not get owner (might be expired but not released)");
            }
        } else {
            console.log("✅ Domain IS available!");
        }
    } catch (error) {
        console.log("Error checking availability:", error.message);
    }
}

main().catch(console.error);
