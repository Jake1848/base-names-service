const hre = require("hardhat");

async function main() {
  console.log("\n🔍 Checking V2 Registrar's baseNode...\n");

  const registrarV2Address = "0x944C89806e1BF7F0Ce48Ffbd5324faa181B79ba9";
  const ensRegistry = "0x5928B6Ff35f61056fCA003A1F8a000d4e89e6F00";

  const V2 = await hre.ethers.getContractFactory("BaseRegistrarImplementationV2");
  const v2 = V2.attach(registrarV2Address);

  console.log("Registrar V2:", registrarV2Address);
  console.log("ENS Registry:", ensRegistry);
  console.log("");

  // Get baseNode from V2
  const baseNode = await v2.baseNode();
  console.log("V2's baseNode:", baseNode);
  console.log("");

  // Calculate what .base namehash should be
  const expectedBaseNode = hre.ethers.namehash("base");
  console.log("Expected .base namehash:", expectedBaseNode);
  console.log("Match:", baseNode === expectedBaseNode ? "✅" : "❌");
  console.log("");

  // Check ENS registry owner of V2's baseNode
  const ENS = await hre.ethers.getContractAt(
    ["function owner(bytes32 node) view returns (address)"],
    ensRegistry
  );

  const owner = await ENS.owner(baseNode);
  console.log("ENS owner of V2's baseNode:", owner);
  console.log("Is V2 registrar:", owner.toLowerCase() === registrarV2Address.toLowerCase() ? "✅" : "❌");
  console.log("");

  // Get ENS address from V2
  const v2EnsAddress = await v2.ens();
  console.log("V2's ENS address:", v2EnsAddress);
  console.log("Expected ENS address:", ensRegistry);
  console.log("Match:", v2EnsAddress.toLowerCase() === ensRegistry.toLowerCase() ? "✅" : "❌");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
