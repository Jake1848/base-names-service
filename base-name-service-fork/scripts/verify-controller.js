const hre = require("hardhat");

async function main() {
  const network = hre.network.name;

  const config = {
    "base-sepolia": {
      registrarV2: "0x944C89806e1BF7F0Ce48Ffbd5324faa181B79ba9",
      controllerV2: "0x60f6BD54E360E24d975fE0DBF6923579636Af484"
    },
    base: {
      registrarV2: "0x5928B6Ff35f61056fCA003A1F8a000d4e89e6F00",
      controllerV2: "0xa4E75471F83Fd718Dd1CB4ca6B24cAcf46F0fa34"
    }
  };

  const networkConfig = config[network];

  const V2 = await hre.ethers.getContractFactory("BaseRegistrarImplementationV2");
  const v2 = V2.attach(networkConfig.registrarV2);

  const isController = await v2.isController(networkConfig.controllerV2);
  console.log(`\n${network} - ControllerV2 authorized:`, isController ? "✅ YES" : "❌ NO");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
