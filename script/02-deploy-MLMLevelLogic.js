const { verify } = require("../utils/verify");
const { ethers, run, network } = require("hardhat");
const deployMLMLevelLogic = async () => {
  const { log } = deployments;
  let moneyOnLevel = [
    ethers.utils.parseEther("0.005"),
    ethers.utils.parseEther("0.01"),
    ethers.utils.parseEther("0.02"),
    ethers.utils.parseEther("0.05"),
    ethers.utils.parseEther("0.1"),
    ethers.utils.parseEther("0.2"),
    ethers.utils.parseEther("0.5"),
    ethers.utils.parseEther("1"),
    ethers.utils.parseEther("2"),
    ethers.utils.parseEther("5"),
  ];
  let percentOnDepth = [10, 7, 5, 2, 1, 1, 1, 1, 1, 1];
  log("Deploying MLMLevelLogic and waiting for confirmations...");
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account: " + deployer.address);

  const mlmLevelLogic = await ethers.getContractFactory("MLMLevelLogic");
  const MLMLevelLogic = await mlmLevelLogic.deploy(
    moneyOnLevel,
    percentOnDepth
  );

  console.log("MLMLevelLogic: " + MLMLevelLogic.address);

  if (network.config.chainId != 31337 && process.env.ETHERSCAN_API_KEY) {
    log("verified");
    await verify(MLMLevelLogic.address, [moneyOnLevel, percentOnDepth]);
  }
  return MLMLevelLogic;
};

module.exports = { deployMLMLevelLogic };
