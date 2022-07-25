// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

import "contracts/interfaces/IMLMLevelLogic.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract MLMLevelLogic is IMLMLevelLogic, Ownable {
    uint256[] private moneyOnLevel;
    uint256[] private percentOnDepth;

    constructor(
        uint256[] memory _moneyOnLevel,
        uint256[] memory _percentOnDepth
    ) {
        moneyOnLevel = _moneyOnLevel;
        percentOnDepth = _percentOnDepth;
    }

    function setMoneyOnLevel(uint256[] memory _moneyOnLevel)
        external
        onlyOwner
    {
        moneyOnLevel = _moneyOnLevel;
    }

    function setPercentOnDipth(uint256[] memory _percentOnDipth)
        external
        onlyOwner
    {
        percentOnDepth = _percentOnDipth;
    }

    function getLevelBySum(uint256 sum) external view returns (uint256) {
        uint256 i;
        for (i = 0; i < moneyOnLevel.length; i++) {
            if (sum < moneyOnLevel[i]) return i;
        }
        return i;
    }

    function getPercentByDipth(uint256 s) external view returns (uint256) {
        s = s - 1;
        if (s < percentOnDepth.length) return percentOnDepth[s];
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
