const hre = require("hardhat");

async function main() {
  console.log("\n🔍 Checking .base node ownership...\n");

  const network = hre.network.name;
  console.log("Network:", network);

  const config = {
    "base-sepolia": {
      ensRegistry: "0x5928B6Ff35f61056fCA003A1F8a000d4e89e6F00",
      registrarV2: "0x944C89806e1BF7F0Ce48Ffbd5324faa181B79ba9"
    },
    base: {
      ensRegistry: "0x5f0C3a1d7B285262cce8D8716bf9718feA6D0f9E",
      registrarV2: "0x5928B6Ff35f61056fCA003A1F8a000d4e89e6F00"
    }
  };

  const networkConfig = config[network];
  console.log("ENS Registry:", networkConfig.ensRegistry);
  console.log("Registrar V2:", networkConfig.registrarV2);
  console.log("");

  // Calculate .base namehash
  const baseLabel = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("base"));
  const baseNode = hre.ethers.namehash("base");

  console.log("Base label hash:", baseLabel);
  console.log("Base namehash:", baseNode);
  console.log("");

  // Check ENS registry
  const ENS = await hre.ethers.getContractAt(
    ["function owner(bytes32 node) view returns (address)"],
    networkConfig.ensRegistry
  );

  const currentOwner = await ENS.owner(baseNode);
  console.log("📋 Current .base node owner:", currentOwner);
  console.log("   Expected (V2 Registrar):", networkConfig.registrarV2);
  console.log("   Match:", currentOwner.toLowerCase() === networkConfig.registrarV2.toLowerCase() ? "✅" : "❌");
  console.log("");

  if (currentOwner.toLowerCase() !== networkConfig.registrarV2.toLowerCase()) {
    console.log("❌ PROBLEM FOUND!");
    console.log("   The V2 registrar does NOT own the .base node in the ENS registry.");
    console.log("   This is why the 'live' modifier is failing.");
    console.log("");
    console.log("💡 Solution: Transfer .base node ownership to V2 registrar");
    console.log(`   ENS.setSubnodeOwner(rootNode, baseLabel, "${networkConfig.registrarV2}")`);
  } else {
    console.log("✅ All good! V2 registrar owns the .base node.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
