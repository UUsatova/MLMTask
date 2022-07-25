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
  let MLMsystem = await deploy("MLMsystem", {
    from: deployer,
    args: [MLMLevelLogic.address],
    log: true,
  });
  log(`MLMsystem deployed at ${MLMsystem.address}`);
  if (network.config.chainId != 31337 && process.env.ETHERSCAN_API_KEY) {
    log("verified");
    await verify(MLMsystem.address, [MLMLevelLogic.address]);
  }
};
//yarn hardhat deploy
