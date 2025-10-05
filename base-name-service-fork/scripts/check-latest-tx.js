const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const txHash = "0x3f0f83563288523a0c91916c06b159173f5c5e09db4c0005a4df63b5052b8c4c";
    
    console.log("\n🔍 Checking Transaction:", txHash, "\n");
    
    try {
        const tx = await provider.getTransaction(txHash);
        const receipt = await provider.getTransactionReceipt(txHash);
        
        console.log("Transaction Details:");
        console.log("  From:", tx.from);
        console.log("  To:", tx.to);
        console.log("  Value:", ethers.formatEther(tx.value), "ETH");
        console.log("  Gas Limit:", tx.gasLimit.toString());
        console.log("  Status:", receipt.status === 1 ? "Success" : "Failed");
        console.log("");
        
        if (receipt.status === 0) {
            console.log("❌ Transaction FAILED");
            console.log("");
            
            // Try to simulate the transaction to get the revert reason
            try {
                await provider.call({
                    to: tx.to,
                    from: tx.from,
                    data: tx.data,
                    value: tx.value,
                    gasLimit: tx.gasLimit
                }, receipt.blockNumber - 1);
            } catch (error) {
                console.log("Revert reason:");
                console.log("  Message:", error.message);
                if (error.data) {
                    console.log("  Data:", error.data);
                    
                    // Try to decode the error
                    const errorSig = error.data.substring(0, 10);
                    console.log("  Error signature:", errorSig);
                    
                    // Check common errors
                    const errors = {
                        "0x836588c9": "CommitmentNotFound(bytes32)",
                        "0x5320bcf9": "CommitmentTooNew(bytes32)",
                        "0xcb7690d7": "CommitmentTooOld(bytes32)",
                        "0x11011294": "InsufficientValue()",
                        "0x477707e8": "NameNotAvailable(string)"
                    };
                    
                    if (errors[errorSig]) {
                        console.log("  Decoded error:", errors[errorSig]);
                    }
                }
            }
        }
    } catch (error) {
        console.log("Error:", error.message);
    }
}

main().catch(console.error);
