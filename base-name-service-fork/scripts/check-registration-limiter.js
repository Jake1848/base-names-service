const hre = require("hardhat");

async function main() {
  const userAddress = "0x5a66231663D22d7eEEe6e2A4781050076E8a3876";
  const limiterAddress = "0x823262c6F3283Ac4901f704769aAD39FE6888c27";

  console.log("\n🔍 Checking RegistrationLimiter...\n");
  console.log("User:", userAddress);
  console.log("Limiter:", limiterAddress);
  console.log("");

  const Limiter = await hre.ethers.getContractAt(
    ["function canRegister(address) view returns (bool)",
     "function recordRegistration(address) external",
     "function owner() view returns (address)"],
    limiterAddress
  );

  try {
    const canRegister = await Limiter.canRegister(userAddress);
    console.log("Can register:", canRegister ? "✅ YES" : "❌ NO");

    const owner = await Limiter.owner();
    console.log("Limiter owner:", owner);

    console.log("\n💡 The limiter is saying:", canRegister ? "You can register!" : "You are NOT AUTHORIZED to register!");
    
    if (!canRegister) {
      console.log("\n🔧 This limiter might have an allowlist or rate limiting.");
      console.log("   We may need to:");
      console.log("   1. Add your address to the allowlist");
      console.log("   2. Or deploy a new limiter that allows everyone");
    }
  } catch (error) {
    console.log("Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
