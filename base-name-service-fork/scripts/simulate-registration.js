const hre = require("hardhat");

async function main() {
  console.log("\n🧪 Simulating Registration Transaction...\n");

  const domain = "jake";
  const owner = "0x5a66231663D22d7eEEe6e2A4781050076E8a3876";
  const duration = 31536000; // 1 year
  const secret = "0x4c9f8b1eb3638dc991b35abf0b1d942b58ae8edcc2d8adb97f9c739f430e7ff9";
  const resolver = hre.ethers.ZeroAddress;
  const data = [];
  const reverseRecord = false;
  const referrer = hre.ethers.ZeroHash;
  const fuses = 0;

  const controllerV2Address = "0x60f6BD54E360E24d975fE0DBF6923579636Af484";

  const Controller = await hre.ethers.getContractFactory("ETHRegistrarControllerV2");
  const controller = Controller.attach(controllerV2Address);

  console.log("Parameters:");
  console.log("  Domain:", domain);
  console.log("  Owner:", owner);
  console.log("  Duration:", duration);
  console.log("  Secret:", secret);
  console.log("  Resolver:", resolver);
  console.log("  Controller:", controllerV2Address);
  console.log("");

  try {
    console.log("📝 Getting price...");
    const price = await controller.rentPrice(domain, duration);
    console.log("  Base:", hre.ethers.formatEther(price[0]), "ETH");
    console.log("  Premium:", hre.ethers.formatEther(price[1]), "ETH");
    console.log("  Total:", hre.ethers.formatEther(price[0] + price[1]), "ETH");
    console.log("");

    const totalPrice = price[0] + price[1];

    console.log("🔍 Checking commitment...");
    const commitment = await controller.makeCommitment(
      domain,
      owner,
      duration,
      secret,
      resolver,
      data,
      reverseRecord,
      referrer,
      fuses
    );
    console.log("  Commitment hash:", commitment);

    const commitmentTimestamp = await controller.commitments(commitment);
    console.log("  Commitment timestamp:", commitmentTimestamp.toString());
    console.log("");

    if (commitmentTimestamp == 0n) {
      console.log("❌ No commitment found! You need to call commit() first.");
      return;
    }

    console.log("🧪 Simulating register() call...");

    // Try to call staticCall first to see if it would succeed
    try {
      await controller.register.staticCall(
        domain,
        owner,
        duration,
        secret,
        resolver,
        data,
        reverseRecord,
        referrer,
        fuses,
        { value: totalPrice }
      );
      console.log("✅ Static call succeeded! Transaction should work.");
    } catch (error) {
      console.log("❌ Static call failed!");
      console.log("");
      console.log("Error:", error.message);
      console.log("");

      // Try to get more details
      if (error.data) {
        console.log("Error data:", error.data);
      }

      // Check if it's a custom error
      if (error.message.includes("NameNotAvailable")) {
        console.log("🔍 Name not available - checking why...");

        const labelHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(domain));
        const tokenId = BigInt(labelHash);

        const registrarV2 = await hre.ethers.getContractAt(
          "BaseRegistrarImplementationV2",
          "0x944C89806e1BF7F0Ce48Ffbd5324faa181B79ba9"
        );

        const available = await registrarV2.available(tokenId);
        const expires = await registrarV2.nameExpires(tokenId);

        console.log("  Available:", available);
        console.log("  Expires:", expires.toString());
        console.log("  Grace period:", expires > 0n && block.timestamp <= expires + 7776000n);
      }
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.stack) {
      console.error("\nStack:", error.stack);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
