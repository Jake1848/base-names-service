const { ethers } = require("hardhat");

async function main() {
    const [signer] = await ethers.getSigners();
    
    const limiter = await ethers.getContractAt(
        "RegistrationLimiter",
        "0x823262c6F3283Ac4901f704769aAD39FE6888c27"
    );
    
    const canRegister = await limiter.canRegister(signer.address);
    console.log("Can register?", canRegister);
    
    const count = await limiter.registrationCount(signer.address);
    console.log("Registration count:", count.toString());
    
    const limit = await limiter.MAX_REGISTRATIONS_PER_ADDRESS();
    console.log("Max limit:", limit.toString());
}

main().catch(console.error);
