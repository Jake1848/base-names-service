const { ethers } = require("ethers");
const namehash = require('eth-ens-namehash');

async function main() {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");

    const ensAddress = "0x9396f642A4bDabE278D51Dad7b277Ba4151bFfAd";
    const newRegistrarAddress = "0xDE42a2c46eBe0878474F1889180589393ed11841";
    const newControllerAddress = "0xba83A942A7c5a2f5c079279C0C5b9a99cC51DA26";
    const baseNode = namehash.hash('base');

    console.log("\n🔍 Verifying New Deployment Configuration\n");
    console.log("ENS Registry:", ensAddress);
    console.log("New Registrar:", newRegistrarAddress);
    console.log("New Controller:", newControllerAddress);
    console.log(".base node:", baseNode);

    // 1. Check if controller is approved in ENS
    console.log("\n1️⃣ Checking ENS Registry Approval...");
    const ensAbi = [
        "function isApprovedForAll(address owner, address operator) view returns (bool)",
        "function owner(bytes32 node) view returns (address)"
    ];
    const ens = new ethers.Contract(ensAddress, ensAbi, provider);

    const baseOwner = await ens.owner(baseNode);
    console.log(".base owner in ENS:", baseOwner);

    const isApproved = await ens.isApprovedForAll(newRegistrarAddress, newControllerAddress);
    console.log("Controller approved in ENS:", isApproved ? "✅" : "❌");

    // 2. Check if controller is added to registrar
    console.log("\n2️⃣ Checking BaseRegistrar Controller Authorization...");
    const registrarAbi = [
        "function controllers(address) view returns (bool)",
        "function ens() view returns (address)",
        "function baseNode() view returns (bytes32)"
    ];
    const registrar = new ethers.Contract(newRegistrarAddress, registrarAbi, provider);

    const isController = await registrar.controllers(newControllerAddress);
    console.log("Controller added to registrar:", isController ? "✅" : "❌");

    const registrarEns = await registrar.ens();
    console.log("Registrar's ENS address:", registrarEns);
    console.log("Matches expected:", registrarEns === ensAddress ? "✅" : "❌");

    const registrarBaseNode = await registrar.baseNode();
    console.log("Registrar's baseNode:", registrarBaseNode);
    console.log("Matches expected:", registrarBaseNode === baseNode ? "✅" : "❌");

    // 3. Check .base ownership
    console.log("\n3️⃣ Checking .base Node Ownership...");
    if (baseOwner === newRegistrarAddress) {
        console.log("✅ New registrar owns .base");
    } else {
        console.log("❌ New registrar does NOT own .base");
        console.log("   Current owner:", baseOwner);
        console.log("   This is the PROBLEM - registrar must own .base to register domains!");
    }

    // 4. Check domain availability
    console.log("\n4️⃣ Checking Domain Availability...");
    const label = "jake";
    const labelhash = ethers.keccak256(ethers.toUtf8Bytes(label));
    const tokenId = BigInt(labelhash);

    const registrarCheckAbi = [
        "function available(uint256 id) view returns (bool)"
    ];
    const registrarCheck = new ethers.Contract(newRegistrarAddress, registrarCheckAbi, provider);

    try {
        const available = await registrarCheck.available(tokenId);
        console.log(`Domain "${label}" available:`, available ? "✅" : "❌");
    } catch (error) {
        console.log("Error checking availability:", error.message);
    }

    // 5. Check commitment
    console.log("\n5️⃣ Checking Recent Commitment...");
    const controllerAbi = [
        "function commitments(bytes32) view returns (uint256)"
    ];
    const controller = new ethers.Contract(newControllerAddress, controllerAbi, provider);

    const commitment = "0xa80f12089258dc495de0ae212757ebb03bb4d218d5a1bed7ed5dfe2938b067f5";
    const commitmentTimestamp = await controller.commitments(commitment);

    if (commitmentTimestamp > 0n) {
        const now = Math.floor(Date.now() / 1000);
        const age = now - Number(commitmentTimestamp);
        console.log("Commitment exists:", "✅");
        console.log("Commitment timestamp:", commitmentTimestamp.toString());
        console.log("Commitment age:", age, "seconds");
        console.log("Ready to register:", age >= 60 ? "✅" : "❌ (too new)");
    } else {
        console.log("Commitment exists:", "❌");
    }

    console.log("\n" + "=".repeat(60));
    console.log("SUMMARY");
    console.log("=".repeat(60));

    if (!isApproved) {
        console.log("❌ PROBLEM: Controller not approved in ENS Registry");
    }
    if (!isController) {
        console.log("❌ PROBLEM: Controller not added to BaseRegistrar");
    }
    if (baseOwner !== newRegistrarAddress) {
        console.log("❌ CRITICAL PROBLEM: New registrar doesn't own .base node!");
        console.log("   This is why registration fails!");
        console.log("   The registrar must own .base to create subdomains");
    }

    if (isApproved && isController && baseOwner === newRegistrarAddress) {
        console.log("✅ All checks passed - registration should work!");
    }
}

main().catch(console.error);
