const { ethers } = require("ethers");
const namehash = require('eth-ens-namehash');

async function main() {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");

    const controllerAddress = "0xCD24477aFCB5D97B3B794a376d6a1De38e640564";
    const registrarAddress = "0x69b81319958388b5133DF617Ba542FB6c9e03177";
    const limiterAddress = "0x823262c6F3283Ac4901f704769aAD39FE6888c27";

    const commitment = "0x2df14ad624c5b21935213442ff68a008fcc505e490a58438e6d96503a390eb7d";
    const label = "jake";
    const labelhash = ethers.keccak256(ethers.toUtf8Bytes(label));
    const tokenId = BigInt(labelhash);

    console.log("\n🔍 Debugging Failed Registration\n");
    console.log("Commitment hash:", commitment);
    console.log("Label:", label);
    console.log("Label hash:", labelhash);
    console.log("Token ID:", tokenId.toString());
    console.log("");

    // 1. Check commitment exists
    console.log("1️⃣ Checking commitment...");
    const controllerAbi = [
        "function commitments(bytes32) view returns (uint256)"
    ];
    const controller = new ethers.Contract(controllerAddress, controllerAbi, provider);
    const commitmentTimestamp = await controller.commitments(commitment);

    if (commitmentTimestamp > 0n) {
        const now = Math.floor(Date.now() / 1000);
        const age = now - Number(commitmentTimestamp);
        console.log("✅ Commitment exists");
        console.log("   Timestamp:", commitmentTimestamp.toString());
        console.log("   Age:", age, "seconds");
        console.log("   Valid (>= 60s):", age >= 60 ? "✅" : "❌");
        console.log("   Valid (<= 86400s):", age <= 86400 ? "✅" : "❌");
    } else {
        console.log("❌ Commitment NOT found!");
        console.log("   This means the hash mismatch between Step 1 and Step 2");
    }

    // 2. Check domain availability
    console.log("\n2️⃣ Checking domain availability...");
    const registrarAbi = [
        "function available(uint256 id) view returns (bool)"
    ];
    const registrar = new ethers.Contract(registrarAddress, registrarAbi, provider);
    const available = await registrar.available(tokenId);
    console.log("Available:", available ? "✅" : "❌");

    // 3. Check rate limiter
    console.log("\n3️⃣ Checking rate limiter...");
    const limiterAbi = [
        "function canRegister(address user) view returns (bool)",
        "function registrations(address user) view returns (uint256 count, uint256 windowStart)"
    ];

    try {
        const limiter = new ethers.Contract(limiterAddress, limiterAbi, provider);
        const userAddress = "0x5a66231663D22d7eEEe6e2A4781050076E8a3876";

        const canRegister = await limiter.canRegister(userAddress);
        console.log("Can register:", canRegister ? "✅" : "❌");

        const registrationData = await limiter.registrations(userAddress);
        console.log("Registration count:", registrationData.count.toString());
        console.log("Window start:", registrationData.windowStart.toString());

        if (!canRegister) {
            console.log("❌ RATE LIMITED!");
            console.log("   User has hit registration limit");
        }
    } catch (error) {
        console.log("Error checking limiter:", error.message);
    }

    // 4. Try to simulate the transaction
    console.log("\n4️⃣ Simulating register() call...");
    const registerAbi = [
        "function register(string name, address owner, uint256 duration, bytes32 secret, address resolver, bytes[] data, bool reverseRecord, uint16 ownerControlledFuses) payable"
    ];

    const controllerWithRegister = new ethers.Contract(controllerAddress, registerAbi, provider);

    try {
        const result = await controllerWithRegister.register.staticCall(
            label,
            "0x5a66231663D22d7eEEe6e2A4781050076E8a3876",
            31536000,
            "0xffa99ec721f72a80b69c4e4cb12ab0c43e43da70105f67569bab063f1a7e5c9f",
            "0x0000000000000000000000000000000000000000",
            [],
            false,
            0,
            { value: 500000000000000n }
        );
        console.log("✅ Simulation succeeded!");
        console.log("Result:", result);
    } catch (error) {
        console.log("❌ Simulation failed!");
        console.log("Error:", error.message);

        if (error.data) {
            console.log("Error data:", error.data);
        }

        // Try to decode the error
        if (error.message.includes("UnexpiredCommitmentExists")) {
            console.log("\n💡 ERROR: UnexpiredCommitmentExists");
            console.log("   A valid commitment already exists for this name");
            console.log("   Wait for it to expire or use a different secret");
        } else if (error.message.includes("CommitmentTooNew")) {
            console.log("\n💡 ERROR: CommitmentTooNew");
            console.log("   The commitment is less than 60 seconds old");
        } else if (error.message.includes("CommitmentTooOld")) {
            console.log("\n💡 ERROR: CommitmentTooOld");
            console.log("   The commitment is more than 24 hours old");
        } else if (error.message.includes("NameNotAvailable")) {
            console.log("\n💡 ERROR: NameNotAvailable");
            console.log("   The domain is already registered");
        } else if (error.message.includes("InsufficientValue")) {
            console.log("\n💡 ERROR: InsufficientValue");
            console.log("   Payment is less than required price");
        }
    }
}

main().catch(console.error);
