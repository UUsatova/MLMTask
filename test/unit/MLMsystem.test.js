const { use, expect, assert } = require("chai");
const { waffleChai } = require("@ethereum-waffle/chai");
const { deployMockContract } = require("@ethereum-waffle/mock-contract");

const { ethers, upgrades } = require("hardhat");

const MLMLevelLogic = require("../../artifacts/contracts/MLMLevelLogic.sol/MLMLevelLogic.json");
const VerificationSystem = require("../../artifacts/contracts/VerificationSystem.sol/VerificationSystem.json");
const ERC20 = require("@openzeppelin/contracts/build/contracts/ERC20.json");

use(waffleChai);

describe("MLMsystem", () => {
  const Transaction = [
    { name: "from", type: "address" },
    { name: "value", type: "uint256" },
    { name: "data", type: "bytes" },
  ];
  const types = { Transaction };
  let message;
  let mockMLMLevelLogic;
  let mockIERC20;
  let accounts;
  let MLMsystem;
  let chainId;
  const sendValue = 100;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    mockMLMLevelLogic = await deployMockContract(
      accounts[0],
      MLMLevelLogic.abi
    );
    mockVerificationSystem = await deployMockContract(
      accounts[0],
      VerificationSystem.abi
    );
    mockIERC20 = await deployMockContract(accounts[0], ERC20.abi);
    const mlmsystem = await ethers.getContractFactory("MLMsystem");
    MLMsystem = await upgrades.deployProxy(
      mlmsystem,
      [
        mockMLMLevelLogic.address,
        mockIERC20.address,
        mockVerificationSystem.address,
      ],
      {
        initializer: "initialize",
      }
    );
    await MLMsystem.deployed();
    chainId = (await ethers.provider.getNetwork()).chainId;
    message = {
      from: accounts[0].address,
      value: 0,
      data: "0x",
    };
  });

  describe("addUser", async function () {
    it("add user by without referral address correctly", async () => {
      domain = {
        name: "MLMsystem",
        version: "0.0.1",
        chainId,
        verifyingContract: mockVerificationSystem.address,
      };

      const signature = await accounts[0]._signTypedData(
        domain,
        types,
        message
      );

      await mockVerificationSystem.mock.verify.returns(true);
      await MLMsystem.addUser(message, signature);

      const response = await MLMsystem.getUserReferalAddress();
      assert.equal(response.toString(), 0);
    });
    it("reverts after fails verification", async () => {
      domain = {
        name: "MLMsystem",
        version: "0.0.1",
        chainId,
        verifyingContract: mockVerificationSystem.address,
      };

      const signature = await accounts[0]._signTypedData(
        domain,
        types,
        message
      );

      await mockVerificationSystem.mock.verify.returns(false);

      await expect(MLMsystem.addUser(message, signature)).to.be.revertedWith(
        "verification failed"
      );
    });
  });
  describe("addUserByRef", async function () {
    it("add user with referral address correctly after successful verification ", async () => {
      domain = {
        name: "MLMsystem",
        version: "0.0.1",
        chainId,
        verifyingContract: mockVerificationSystem.address,
      };

      const signature = await accounts[0]._signTypedData(
        domain,
        types,
        message
      );
      await mockVerificationSystem.mock.verify.returns(true);

      const actualAddress = await accounts[0].getAddress();
      await MLMsystem.addUserByRef(message, signature, actualAddress);

      const response = await MLMsystem.getUserReferalAddress();
      assert.equal(response.toString(), actualAddress.toString());
    });
    it("reverts after fails verification", async () => {
      domain = {
        name: "MLMsystem",
        version: "0.0.1",
        chainId,
        verifyingContract: mockVerificationSystem.address,
      };

      const signature = await accounts[0]._signTypedData(
        domain,
        types,
        message
      );
      await mockVerificationSystem.mock.verify.returns(false);
      const actualAddress = await accounts[0].getAddress();
      await expect(
        MLMsystem.addUserByRef(message, signature, actualAddress)
      ).to.be.revertedWith("verification failed");
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
      domain = {
        name: "MLMsystem",
        version: "0.0.1",
        chainId,
        verifyingContract: mockVerificationSystem.address,
      };

      const signature = await accounts[0]._signTypedData(
        domain,
        types,
        message
      );

      await mockVerificationSystem.mock.verify.returns(true);
      await MLMsystem.addUser(message, signature);
      const actualAddress = await accounts[0].getAddress();
      await MLMsystem.connect(accounts[1]);
      await MLMsystem.addUserByRef(message, signature, actualAddress);
      await MLMsystem.connect(accounts[2]);
      await MLMsystem.addUserByRef(message, signature, actualAddress);
      await MLMsystem.connect(accounts[3]);
      await MLMsystem.addUserByRef(message, signature, actualAddress);
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
      await mockVerificationSystem.mock.verify.returns(true);

      domain = {
        name: "MLMsystem",
        version: "0.0.1",
        chainId,
        verifyingContract: mockVerificationSystem.address,
      };

      const signature = await accounts[0]._signTypedData(
        domain,
        types,
        message
      );

      await MLMsystem.addUser(message, signature);
      await MLMsystem.investInMLM(sendValue);
      await MLMsystem.withdrawMoney();
      assert.equal(await MLMsystem.getUserAccount(), 0);
    });

    it("user withdraws money and commission is correctly charged to another 3 users.All of them are connected to each other by referral links", async () => {
      await mockIERC20.mock.transferFrom.returns(true);
      await mockIERC20.mock.allowance.returns(ethers.utils.parseEther("1"));
      await mockIERC20.mock.transfer.returns(true);
      await mockVerificationSystem.mock.verify.returns(true);

      let currentConnectContract;
      domain = {
        name: "MLMsystem",
        version: "0.0.1",
        chainId,
        verifyingContract: mockVerificationSystem.address,
      };

      const signature = await accounts[0]._signTypedData(
        domain,
        types,
        message
      );

      const money = ["0.015", "0.007", "0.006", "0.06"];
      const level = [2, 1, 1, 4];
      for (let index = 3; index >= 0; index--) {
        currentConnectContract = await MLMsystem.connect(accounts[index]);
        if (index == 3) {
          await currentConnectContract.addUser(message, signature);
        } else {
          await currentConnectContract.addUserByRef(
            message,
            signature,
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
      domain = {
        name: "MLMsystem",
        version: "0.0.1",
        chainId,
        verifyingContract: mockVerificationSystem.address,
      };

      const signature = await accounts[0]._signTypedData(
        domain,
        types,
        message
      );

      await mockVerificationSystem.mock.verify.returns(true);
      await MLMsystem.addUser(message, signature);
      await MLMsystem.investInMLM(sendValue);
      await expect(MLMsystem.withdrawMoney()).to.be.revertedWith(
        "Failed to send user balance back to the user"
      );
    });
  });
});
