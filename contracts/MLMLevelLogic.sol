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

    function getLevelBySum(uint256 sum) external view returns (uint256) {
        uint256 i;
        for (i = 0; i < moneyOnLevel.length; i++) {
            if (sum < moneyOnLevel[i]) return i;
        }
        return i;
    }

    function getPercentByDepth(uint256 s) external view returns (uint256) {
        require(s > 0, "depth can only be positive");
        s = s - 1;
        if (s < percentOnDepth.length) return percentOnDepth[s];
        return 0;
    }

    function setMoneyOnLevelArray(uint256[] memory _moneyOnLevel)
        external
        onlyOwner
    {
        moneyOnLevel = _moneyOnLevel;
    }

    function setPercentOnDepthArray(uint256[] memory _percentOnDipth)
        external
        onlyOwner
    {
        percentOnDepth = _percentOnDipth;
    }

    function getMoneyOnLevelArray()
        external
        view
        onlyOwner
        returns (uint256[] memory)
    {
        return moneyOnLevel;
    }

    function getPercentOnDepthArray()
        external
        view
        onlyOwner
        returns (uint256[] memory)
    {
        return percentOnDepth;
    }
}
