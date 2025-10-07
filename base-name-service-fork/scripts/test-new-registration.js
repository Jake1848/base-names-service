const hre = require("hardhat");

async function main() {
  console.log("\n🧪 Testing registration with NEW controller...\n");

  const domain = "jake";
  const owner = "0x5a66231663D22d7eEEe6e2A4781050076E8a3876";
  const duration = 31536000;
  const secret = "0x83711e8c45414bbf237bdf34917011f8651ae87dd292a3f1bfc50af69b068150"; // From latest attempt
  const resolver = hre.ethers.ZeroAddress;
  const data = [];
  const reverseRecord = false;
  const referrer = hre.ethers.ZeroHash;
  const fuses = 0;

  const controllerAddress = "0x8E3132Ce6649627a8Cd5372F4a5Ebf553df5eaf6";
  const registrarAddress = "0xc22BB0C1C7D611686CF9DE6894Bf9B6D87D24ba6";

  console.log("Controller:", controllerAddress);
  console.log("Registrar:", registrarAddress);
  console.log("Domain:", domain);
  console.log("");

  const Controller = await hre.ethers.getContractFactory("ETHRegistrarControllerV2");
  const controller = Controller.attach(controllerAddress);

  // Check commitment
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
  console.log("Commitment hash:", commitment);

  const commitmentTimestamp = await controller.commitments(commitment);
  console.log("Commitment timestamp:", commitmentTimestamp.toString());
  console.log("Current time:", Math.floor(Date.now() / 1000));
  console.log("Commitment age:", Math.floor(Date.now() / 1000) - Number(commitmentTimestamp), "seconds");
  console.log("");

  if (commitmentTimestamp == 0n) {
    console.log("❌ No commitment found!");
    return;
  }

  // Check if domain is available
  const labelHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(domain));
  const tokenId = BigInt(labelHash);

  const Registrar = await hre.ethers.getContractFactory("BaseRegistrarImplementationV2");
  const registrar = Registrar.attach(registrarAddress);

  const available = await registrar.available(tokenId);
  console.log("Domain available:", available);

  if (!available) {
    console.log("❌ Domain not available!");
    const expires = await registrar.nameExpires(tokenId);
    console.log("Expires:", expires.toString());
    return;
  }

  // Check if name is valid
  const valid = await controller.valid(domain);
  console.log("Name valid:", valid);
  console.log("");

  // Get price
  const price = await controller.rentPrice(domain, duration);
  const totalPrice = price[0] + price[1];
  console.log("Price:", hre.ethers.formatEther(totalPrice), "ETH");
  console.log("");

  // Try static call
  console.log("🧪 Attempting static call...");
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
    console.log("✅ Static call SUCCEEDED! Transaction should work.");
  } catch (error) {
    console.log("❌ Static call FAILED!");
    console.log("");
    console.log("Error:", error.message);
    
    // Try to decode error
    if (error.data) {
      console.log("Error data:", error.data);
      
      // Check for specific error patterns
      if (error.message.includes("CommitmentTooNew")) {
        console.log("\n💡 Commitment is too new. Wait at least 60 seconds after committing.");
      } else if (error.message.includes("InsufficientValue")) {
        console.log("\n💡 Insufficient ETH sent. Need:", hre.ethers.formatEther(totalPrice), "ETH");
      } else if (error.message.includes("NameNotAvailable")) {
        console.log("\n💡 Name is not available or in grace period.");
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
