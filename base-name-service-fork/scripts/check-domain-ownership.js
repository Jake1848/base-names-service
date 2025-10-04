const { ethers } = require("ethers");

async function main() {
    const domain = process.argv[2] || "jake";
    const yourAddress = "0x5a66231663D22d7eEEe6e2A4781050076E8a3876";

    console.log(`\n🔍 Checking ownership of ${domain}.base on Base Sepolia\n`);

    // Connect to Base Sepolia
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");

    const registrarAbi = [
        "function available(uint256 id) view returns (bool)",
        "function ownerOf(uint256 tokenId) view returns (address)",
        "function nameExpires(uint256 id) view returns (uint256)"
    ];

    const registrar = new ethers.Contract(
        "0x69b81319958388b5133DF617Ba542FB6c9e03177",
        registrarAbi,
        provider
    );

    // Get token ID
    const tokenId = ethers.keccak256(ethers.toUtf8Bytes(domain));
    console.log("Token ID:", tokenId);
    console.log("Your address:", yourAddress);

    // Check if available
    const available = await registrar.available(tokenId);
    console.log("\nAvailable:", available);

    if (!available) {
        console.log("✅ Domain is registered!\n");

        // Get owner
        try {
            const owner = await registrar.ownerOf(tokenId);
            console.log("Owner:", owner);

            if (owner.toLowerCase() === yourAddress.toLowerCase()) {
                console.log("✅ YOU OWN THIS DOMAIN!\n");
            } else {
                console.log("❌ Someone else owns this domain\n");
            }

            // Get expiry
            const expiry = await registrar.nameExpires(tokenId);
            const expiryDate = new Date(Number(expiry) * 1000);
            console.log("Expires:", expiryDate.toLocaleString());
            console.log("Expires (timestamp):", expiry.toString());

        } catch (e) {
            console.log("❌ Error checking owner:", e.message);
        }
    } else {
        console.log("❌ Domain is still available (registration may have failed)\n");
    }

    // Check BaseScan for the NFT
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔗 Check your NFTs on BaseScan:");
    console.log(`https://sepolia.basescan.org/address/${yourAddress}#tokentxnsErc721`);
    console.log("\n🔗 Check BaseRegistrar contract:");
    console.log(`https://sepolia.basescan.org/token/0x69b81319958388b5133DF617Ba542FB6c9e03177?a=${yourAddress}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main().catch(console.error);
