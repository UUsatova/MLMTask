const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { deploy, log } = deployments;

describe("MLMLevelLogic", () => {
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
  let deployer;
  let MLMLevelLogic;
  beforeEach(async () => {
    deployer = await ethers.getSigners();
    const mlmLevelLogic = await ethers.getContractFactory("MLMLevelLogic");
    MLMLevelLogic = await mlmLevelLogic.deploy(moneyOnLevel, percentOnDepth);
  });

  describe("constructor", async function () {
    it("sets arrays with percentOnDepth correctly", async () => {
      const response = await MLMLevelLogic.getPercentOnDepthArray();
      assert.equal(response.toString(), percentOnDepth.toString());
    });

    it("sets arrays with moneyOnLevel correctly", async () => {
      const response = await MLMLevelLogic.getMoneyOnLevelArray();
      assert.equal(response.toString(), moneyOnLevel.toString());
    });
  });

  describe("getLevelBySum", async function () {
    it("return 0 level with sum equal 4000000000000000", async () => {
      const response = await MLMLevelLogic.getLevelBySum(4000000000000000);
      assert.equal(response, 0);
    });

    it("return 1 level with sum equal 5000000000000000", async () => {
      const response = await MLMLevelLogic.getLevelBySum(5000000000000000);
      assert.equal(response, 1);
    });

    it("return 10 level with sum equal 6000000000000000000", async () => {
      const response = await MLMLevelLogic.getLevelBySum(6000000000000000000n);
      assert.equal(response, 10);
    });
  });

  describe("getPercentByDipth", async function () {
    it("return pencent * 10 with depth equal 1", async () => {
      const response = await MLMLevelLogic.getPercentByDepth(1);
      assert.equal(response, 10);
    });

    it("return pencent * 10 with depth equal 10", async () => {
      const response = await MLMLevelLogic.getPercentByDepth(10);
      assert.equal(response, 1);
    });

    it("return pencent * 10 with depth equal 11", async () => {
      const response = await MLMLevelLogic.getPercentByDepth(11);
      assert.equal(response, 0);
    });

    it("return error with depth equal 0 ", async () => {
      await expect(MLMLevelLogic.getPercentByDepth(0)).to.be.revertedWith(
        "depth can only be positive"
      );
    });
  });

  describe("setMoneyOnLevelArray", async function () {
    it("sets another array with moneyOnLevel by owner correctly", async () => {
      const anotherMoneyOnLevel = [1, 2, 3];
      await MLMLevelLogic.setMoneyOnLevelArray(anotherMoneyOnLevel);
      const response = await MLMLevelLogic.getMoneyOnLevelArray();
      assert.equal(response.toString(), anotherMoneyOnLevel.toString());
    });
    it("only owner can set the array", async () => {
      const anotherMoneyOnLevel = [1, 2, 3];
      const accounts = await ethers.getSigners();
      const MLMLevelLogicConnectedContract = await MLMLevelLogic.connect(
        accounts[1]
      );
      await expect(
        MLMLevelLogicConnectedContract.setMoneyOnLevelArray(anotherMoneyOnLevel)
      ).to.be.revertedWith("");
    });
  });

  describe("setPercentOnDepthArray", async function () {
    it("sets another array with percentOnDepth by owner correctly", async () => {
      const anotherPercentOnDepth = [1, 2, 3];
      await MLMLevelLogic.setPercentOnDepthArray(anotherPercentOnDepth);
      const response = await MLMLevelLogic.getPercentOnDepthArray();
      assert.equal(response.toString(), anotherPercentOnDepth.toString());
    });

    it("only owner can set the array", async () => {
      const anotherPercentOnDepth = [1, 2, 3];
      const accounts = await ethers.getSigners();
      const MLMLevelLogicConnectedContract = await MLMLevelLogic.connect(
        accounts[1]
      );
      await expect(
        MLMLevelLogicConnectedContract.setPercentOnDepthArray(
          anotherPercentOnDepth
        )
      ).to.be.revertedWith("");
    });
  });
});
