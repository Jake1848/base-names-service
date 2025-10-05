const { ethers } = require("ethers");

async function main() {
    const errorData = "0x836588c9e6be8a2078a09981432434cdb92c9844889feb6b6e3b197908b5fcdb32943403";
    
    console.log("\n🔍 Decoding Custom Error\n");
    console.log("Error data:", errorData);
    console.log("Error selector:", errorData.substring(0, 10));
    console.log("");

    // The error selector is 0x836588c9
    // Common ENS controller errors include:
    // - UnexpiredCommitmentExists
    // - CommitmentTooNew
    // - CommitmentTooOld
    // - InsufficientValue
    
    // Let's calculate what error this might be
    const possibleErrors = [
        "UnexpiredCommitmentExists(bytes32)",
        "CommitmentTooNew(bytes32)",
        "CommitmentTooOld(bytes32)",
        "InsufficientValue()",
        "MaxCommitmentAgeTooLow()",
        "MaxCommitmentAgeTooHigh()",
        "DurationTooShort(uint256)",
        "ResolverRequiredWhenDataSupplied()",
        "NameNotAvailable(string)"
    ];

    console.log("Checking common ENS controller errors:");
    for (const errorSig of possibleErrors) {
        const selector = ethers.id(errorSig).substring(0, 10);
        const match = selector === "0x836588c9" ? " ← MATCH!" : "";
        console.log("  " + errorSig.padEnd(40) + " " + selector + match);
    }

    console.log("");
    
    // Try to decode the parameter (commitment hash)
    if (errorData.length > 10) {
        const param = "0x" + errorData.substring(10);
        console.log("Error parameter (might be commitment hash):", param);
    }
}

main().catch(console.error);
