const { verify } = require("../utils/verify");
const { ethers } = require("hardhat");
const deployVerificationSystem = async () => {
  const signers = await ethers.getSigners();
  console.log("Deploying contracts with the account: " + signers[0].address);

  const verificationSystemContractFactory = await ethers.getContractFactory(
    "VerificationSystem"
  );
  const VerificationSystem = await verificationSystemContractFactory.deploy(
    "MLMsystem",
    "0.0.1"
  );
  await VerificationSystem.deployed();

  console.log("VerificationSystem: " + VerificationSystem.address);

  if (network.config.chainId != 31337 && process.env.ETHERSCAN_API_KEY) {
    log("verified");
    await verify(VerificationSystem.address, ["MLMsystem", "0.0.1"]);
  }
  return VerificationSystem;
};

module.exports = { deployVerificationSystem };
