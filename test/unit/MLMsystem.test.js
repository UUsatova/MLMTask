const { use, expect, assert } = require("chai");
const { waffleChai } = require("@ethereum-waffle/chai");
const { deployMockContract } = require("@ethereum-waffle/mock-contract");

const { ethers, upgrades } = require("hardhat");

const MLMLevelLogic = require("../../build/MLMLevelLogic.json"); ///@openzeppelin/contracts/build/contracts/ERC20.json
const ERC20 = require("@openzeppelin/contracts/build/contracts/ERC20.json");

use(waffleChai);

describe("MLMsystem", () => {
  let mockMLMLevelLogic;
  let mockIERC20;
  let deployer;
  let MLMsystem;
  const sendValue = 100;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    mockMLMLevelLogic = await deployMockContract(deployer, MLMLevelLogic.abi);
    mockIERC20 = await deployMockContract(deployer, ERC20.abi);
    const mlmsystem = await ethers.getContractFactory("MLMsystem");
    MLMsystem = await upgrades.deployProxy(
      mlmsystem,
      [mockMLMLevelLogic.address, mockIERC20.address],
      {
        initializer: "initialize",
      }
    );
    await MLMsystem.deployed();
  });

  describe("addUser", async function () {
    it("add user by with referral address correctly", async () => {
      const accounts = await ethers.getSigners();
      const actualAddress = await accounts[1].getAddress();
      await MLMsystem["addUser(address)"](actualAddress);
      const response = await MLMsystem.getUserReferalAddress();
      assert.equal(response.toString(), actualAddress.toString());
    });
    it("add user by without referral address correctly", async () => {
      await MLMsystem["addUser()"]();
      const response = await MLMsystem.getUserReferalAddress();
      assert.equal(response.toString(), 0);
    });
  });

  describe("investInMLM", async function () {
    it("correctly credits money to the user's account", async () => {
      await mockIERC20.mock.transferFrom.returns(true);
      await mockIERC20.mock.allowance.returns(sendValue);

      await MLMsystem.investInMLM(sendValue);
      const response = await MLMsystem.getUserAccount();
      assert.equal(response, (sendValue * 95) / 100);
    });

    it("reverts transaction when amount of Tokens equal 0", async () => {
      await mockIERC20.mock.allowance.returns(0);
      await expect(MLMsystem.investInMLM(0)).to.be.revertedWith("");
    });
    it("reverts transaction when transferFrom returns false", async () => {
      await mockIERC20.mock.transferFrom.returns(false);
      await mockIERC20.mock.allowance.returns(sendValue);
      await expect(MLMsystem.investInMLM(sendValue)).to.be.revertedWith("");
    });
  });

  describe("getUserLevel", async function () {
    it("correctlly returns users' level ", async () => {
      await mockMLMLevelLogic.mock.getLevelBySum.returns(8);
      const response = await MLMsystem.getUserLevel();
      assert.equal(response, 8);
    });
  });

  describe("getAmountOfDirrectPartners", async function () {
    it("correctly returns number of user's dirrect partners", async () => {
      const accounts = await ethers.getSigners();
      await MLMsystem["addUser()"]();
      const actualAddress = await accounts[0].getAddress();
      await MLMsystem.connect(accounts[1]);
      await MLMsystem["addUser(address)"](actualAddress);
      await MLMsystem.connect(accounts[2]);
      await MLMsystem["addUser(address)"](actualAddress);
      await MLMsystem.connect(accounts[3]);
      await MLMsystem["addUser(address)"](actualAddress);
      await MLMsystem.connect(accounts[0]);
      const response = await MLMsystem.getAmountOfDirrectPartners();
      assert.equal(response, 3);
    });
  });

  describe("withdrawMoney", async function () {
    it("user without referral user withdraw Money,his system account equal 0", async () => {
      await mockIERC20.mock.transferFrom.returns(true);
      await mockIERC20.mock.allowance.returns(sendValue);
      await mockIERC20.mock.transfer.returns(true);

      await MLMsystem["addUser()"]();
      await MLMsystem.investInMLM(sendValue);
      await MLMsystem.withdrawMoney();
      assert.equal(await MLMsystem.getUserAccount(), 0);
    });

    it("user withdraws money and commission is correctly charged to another 3 users.All of them are connected to each other by referral links", async () => {
      await mockIERC20.mock.transferFrom.returns(true);
      await mockIERC20.mock.allowance.returns(ethers.utils.parseEther("1"));
      await mockIERC20.mock.transfer.returns(true);

      const accounts = await ethers.getSigners();
      let currentConnectContract;

      const money = ["0.015", "0.007", "0.006", "0.06"];
      const level = [2, 1, 1, 4];
      for (let index = 3; index >= 0; index--) {
        currentConnectContract = await MLMsystem.connect(accounts[index]);
        if (index == 3) {
          await currentConnectContract["addUser()"]();
        } else {
          await currentConnectContract["addUser(address)"](
            await accounts[index + 1].getAddress()
          );
        }
        await currentConnectContract.investInMLM(
          ethers.utils.parseEther(money[index])
        );
        await mockMLMLevelLogic.mock.getLevelBySum
          .withArgs(await currentConnectContract.getUserAccount())
          .returns(level[index]);
      }

      let percentOnDepth = [10, 7, 5, 2, 1, 1, 1, 1, 1, 1];
      for (let i = 1; i <= 10; i++) {
        await mockMLMLevelLogic.mock.getPercentByDepth
          .withArgs(i)
          .returns(percentOnDepth[i - 1]);
      }
      await currentConnectContract.withdrawMoney();

      const resultAccounts = ["0", "0.0067925", "0.0057", "0.05707125"];
      for (let index = 0; index < resultAccounts.length; index++) {
        assert.equal(
          (
            await MLMsystem.connect(accounts[index]).getUserAccount()
          ).toString(),
          ethers.utils.parseEther(resultAccounts[index]).toString()
        );
      }
    });

    it("return error with zero users' account", async () => {
      await expect(MLMsystem.withdrawMoney()).to.be.revertedWith(
        "not enough money"
      );
    });

    it("return error when transfer returns false", async () => {
      await mockIERC20.mock.transferFrom.returns(true);
      await mockIERC20.mock.allowance.returns(sendValue);
      await mockIERC20.mock.transfer.returns(false);

      await MLMsystem["addUser()"]();
      await MLMsystem.investInMLM(sendValue);
      await expect(MLMsystem.withdrawMoney()).to.be.revertedWith(
        "Failed to send user balance back to the user"
      );
    });
  });
});
