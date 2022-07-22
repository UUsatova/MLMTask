// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

import "./MLMLevelLogicInterface.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract MLMLevelLogic is MLMLevelLogicInterface, Ownable {
    uint[] private moneyOnLevel;
    uint[] private percentOnDipth;

    constructor(uint[] memory _moneyOnLevel, uint[] memory _percentOnDipth) {
        moneyOnLevel = _moneyOnLevel;
        percentOnDipth = _percentOnDipth;
    }

    function setMoneyOnLevel(uint[] memory _moneyOnLevel) external onlyOwner {
        moneyOnLevel = _moneyOnLevel;
    }

    function setPercentOnDipth(uint[] memory _percentOnDipth)
        external
        onlyOwner
    {
        percentOnDipth = _percentOnDipth;
    }

    function getLevelBySum(uint sum) external view returns (uint) {
        uint i;
        for (i = 0; i < moneyOnLevel.length; i++) {
            if (sum < moneyOnLevel[i]) return i;
        }
        return i;
    }

    function getPercentByDipth(uint s) external view returns (uint) {
        s = s - 1;
        if (s < percentOnDipth.length) return percentOnDipth[s];
        return 0;
    }
}

// ammountOfMoneyOfAccount[0] = 5000000000000000;
// ammountOfMoneyOfAccount[1] = 10000000000000000;
// ammountOfMoneyOfAccount[2] = 20000000000000000;
// ammountOfMoneyOfAccount[3] = 50000000000000000;
// ammountOfMoneyOfAccount[4] = 100000000000000000;
// ammountOfMoneyOfAccount[5] = 200000000000000000;
// ammountOfMoneyOfAccount[6] = 500000000000000000;
// ammountOfMoneyOfAccount[7] = 1000000000000000000;
// ammountOfMoneyOfAccount[8] = 2000000000000000000;
// ammountOfMoneyOfAccount[9] = 5000000000000000000;
