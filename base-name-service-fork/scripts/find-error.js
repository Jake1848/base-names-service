const { ethers } = require("ethers");

async function main() {
    const targetSelector = "0x836588c9";
    
    console.log("\n🔍 Finding Error Signature for:", targetSelector);
    console.log("");

    // More comprehensive list of possible errors
    const possibleErrors = [
        "UnexpiredCommitmentExists(bytes32)",
        "CommitmentTooNew(bytes32)",
        "CommitmentTooOld(bytes32)",
        "InsufficientValue()",
        "NameNotAvailable(string)",
        "Unauthorised(bytes32)",
        "InvalidName(string)",
        "DurationTooShort(uint256)",
        "ResolverRequiredWhenDataSupplied()",
        "UnauthorisedAddr(bytes32)",
        "UnauthorisedNode(bytes32)",
        "OperationProhibited(bytes32)",
        "InvalidCommitment(bytes32)",
        "CommitmentNotFound(bytes32)",
        "InsufficientFunds()",
        "InvalidDuration()",
        "InvalidSecret()",
        "RegistrationNotAllowed()",
        "AlreadyRegistered()",
        "InvalidResolver()",
        "InvalidOwner()",
        "Paused()",
        "NotOwner()",
        "ExpiredName(string)",
        "PremiumNotAllowed()",
        "InvalidLabel(string)",
        "InvalidNode(bytes32)",
        "CannotSetResolver()",
        "InvalidParameters()",
        "UnauthorizedCaller(address)",
        "InsufficientEtherProvided()",
        "ValueMismatch()",
        "MinCommitmentAgeTooLow()",
        "MinCommitmentAgeTooHigh()",
        "PriceTooLow(uint256)",
        "InvalidPrice()",
        "IncorrectCommitment(bytes32)"
    ];

    let found = false;
    for (const errorSig of possibleErrors) {
        const selector = ethers.id(errorSig).substring(0, 10);
        if (selector === targetSelector) {
            console.log("✅ FOUND:", errorSig);
            console.log("   Selector:", selector);
            found = true;
            break;
        }
    }

    if (!found) {
        console.log("❌ Error signature not found in common list");
        console.log("");
        console.log("The error might be:");
        console.log("  - A custom error specific to this implementation");
        console.log("  - Requires checking the contract source code");
        console.log("");
        console.log("Error data contains:", "0xe6be8a2078a09981432434cdb92c9844889feb6b6e3b197908b5fcdb32943403");
        console.log("This looks like a bytes32 parameter (possibly a commitment hash or node)");
    }
}

main().catch(console.error);
