const { verify } = require("../utils/verify");
const { ethers, run, network, upgrades } = require("hardhat");
// TODO: разбить на два файлика
async function main() {
  const { log } = deployments;
  //TODO: ввести корректные данные
  let moneyOnLevel = [1, 2, 3];
  let percentOnDipth = [1, 2, 3];
  log("Deploying MLMLevelLogic and waiting for confirmations...");
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account: " + deployer.address);
  // TODO: переименовать нормально
  // Deploy First
  const First = await ethers.getContractFactory("MLMLevelLogic");
  const first = await First.deploy(moneyOnLevel, percentOnDipth);

  // Deploy Second
  const Second = await ethers.getContractFactory("MLMsystem");
  const second = await upgrades.deployProxy(Second, [first.address], {
    initializer: "initialize",
  });
  await second.deployed();

  console.log("First: " + first.address);
  console.log("Second: " + second.address);

  if (network.config.chainId != 31337 && process.env.ETHERSCAN_API_KEY) {
    log("verified");
    await verify(second.address, [first.address]);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
//yarn hardhat run deploy/01-deploy-MLM.js
