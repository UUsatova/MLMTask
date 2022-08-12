const { verify } = require("../utils/verify");
const { ethers, run, network, upgrades } = require("hardhat");
const { deployMLMLevelLogic } = require("../script/02-deploy-MLMLevelLogic");
const { deployCringeToken } = require("../script/03-deploy-CringeToken");
const {
  deployVerificationSystem,
} = require("../script/04-deploy-VerificationSystem");
async function main() {
  const { log } = deployments;
  const [deployer] = await ethers.getSigners();
  const MLMLevelLogic = await deployMLMLevelLogic();
  const CustomToken = await deployCringeToken();
  const VerificationSystem = await deployVerificationSystem();
  console.log("Deploying contracts with the account: " + deployer.address);

  const mlmsystem = await ethers.getContractFactory("MLMsystem");
  const MLMsystem = await upgrades.deployProxy(
    mlmsystem,
    [MLMLevelLogic.address, CustomToken.address, VerificationSystem.address],

    {
      initializer: "initialize",
    }
  );
  await MLMsystem.deployed();

  console.log("MLMsystem: " + MLMsystem.address);

  if (network.config.chainId != 31337 && process.env.ETHERSCAN_API_KEY) {
    log("verified");
    await verify(MLMsystem.address, [
      MLMLevelLogic.address,
      CustomToken.address,
      VerificationSystem.address,
    ]);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
//yarn hardhat run deploy/01-deploy-MLM.js
