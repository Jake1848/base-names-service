const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const registrarAddress = "0x69b81319958388b5133DF617Ba542FB6c9e03177";
    const tokenId = "6044132455233468710761751131267304914194328600419141547035404655352077591875";

    console.log("\n🔍 Checking NFT Metadata\n");
    console.log("Registrar:", registrarAddress);
    console.log("Token ID:", tokenId);
    console.log("");

    const registrarAbi = [
        "function tokenURI(uint256 tokenId) view returns (string)",
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function ownerOf(uint256 tokenId) view returns (address)"
    ];

    const registrar = new ethers.Contract(registrarAddress, registrarAbi, provider);

    try {
        const name = await registrar.name();
        const symbol = await registrar.symbol();
        const owner = await registrar.ownerOf(tokenId);
        
        console.log("NFT Collection Name:", name);
        console.log("Symbol:", symbol);
        console.log("Owner:", owner);
        console.log("");

        try {
            const uri = await registrar.tokenURI(tokenId);
            console.log("Token URI:", uri);
            
            if (uri.startsWith('data:')) {
                console.log("\n✅ Has embedded metadata!");
                const decoded = Buffer.from(uri.split(',')[1], 'base64').toString();
                console.log("Decoded:", JSON.parse(decoded));
            } else if (uri.startsWith('http')) {
                console.log("\n✅ Has external metadata URL");
            }
        } catch (uriError) {
            console.log("❌ No tokenURI() function or it reverted");
            console.log("Error:", uriError.message.substring(0, 100));
            console.log("");
            console.log("ISSUE: The contract doesn't return metadata!");
            console.log("This is why MetaMask shows just a token ID.");
        }
    } catch (error) {
        console.log("Error:", error.message);
    }
}

main().catch(console.error);
