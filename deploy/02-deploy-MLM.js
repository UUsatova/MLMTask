module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  let moneyOnLevel = [1, 2, 3];
  let percentOnDipth = [1, 2, 3];
  let MLMLevelLogic = await deploy("MLMLevelLogic", {
    from: deployer,
    args: [moneyOnLevel, percentOnDipth],
    log: true,
  });
  log(`MLMLevelLogic deployed at ${MLMLevelLogic.address}`);
  let MLMsistem = await deploy("MLMsistem", {
    from: deployer,
    args: [MLMLevelLogic.address],
    log: true,
  });
  log(`MLMsistem deployed at ${MLMsistem.address}`);
  if (network.config.chainId != 31337 && process.env.ETHERSCAN_API_KEY) {
    log("verified");
    await verify(MLMsistem.address, [MLMLevelLogic.address]);
  }
};
//yarn hardhat deploy
