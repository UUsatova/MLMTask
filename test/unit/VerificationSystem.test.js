const { use, expect, assert } = require("chai");
const { waffleChai } = require("@ethereum-waffle/chai");
const { deployMockContract } = require("@ethereum-waffle/mock-contract");
const { ethers } = require("hardhat");
describe("VerificationSystem", () => {
  const Transaction = [
    { name: "from", type: "address" },
    { name: "value", type: "uint256" },
    { name: "data", type: "bytes" },
  ];
  const types = { Transaction };
  let VerificationSystem;
  let signers;
  let chainId;
  beforeEach(async () => {
    signers = await ethers.getSigners();
    const verificationSystemContractFactory = await ethers.getContractFactory(
      "VerificationSystem"
    );
    VerificationSystem = await verificationSystemContractFactory.deploy(
      "MLMsystem",
      "0.0.1"
    );
    await VerificationSystem.deployed();
    chainId = (await ethers.provider.getNetwork()).chainId;
  });

  describe("verify", async function () {
    it("verification passed with the correct data entered", async () => {
      domain = {
        name: "MLMsystem",
        version: "0.0.1",
        chainId,
        verifyingContract: VerificationSystem.address,
      };
      let message = {
        from: signers[0].address,
        value: 0,
        data: "0x",
      };

      const signature = await signers[0]._signTypedData(domain, types, message);
      const verifiedFromContract = await VerificationSystem.verify(
        message,
        signature
      );
      assert.equal(verifiedFromContract, true);
    });

    it("verification failed with the incorrect data entered", async () => {
      domain = {
        name: "MLMsystem",
        version: "0.0.1",
        chainId,
        verifyingContract: VerificationSystem.address,
      };

      let message = {
        from: signers[1].address,
        value: 0,
        data: "0x",
      };

      const signature = await signers[0]._signTypedData(domain, types, message);
      const verifiedFromContract = await VerificationSystem.verify(
        message,
        signature
      );
      assert.equal(verifiedFromContract, false);
    });
  });
});
