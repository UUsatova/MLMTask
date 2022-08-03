// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

import "contracts/interfaces/IMLMLevelLogic.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

/**
 * @title A level logic manipulator
 * @author UUsatova
 * @notice This contract is auxiliary contract to MLMsystem contract.
 * It establishes a correspondence between ammount of money and level,and percent and depth level.
 * Also it allows the owner to manipulate these points.
 */
contract MLMLevelLogic is IMLMLevelLogic, Ownable {
    uint256[] private moneyOnLevel;
    uint256[] private percentOnDepth;

    /**
     * @dev Initializes the contract with following parametrs
     * @param _moneyOnLevel a correspondence between ammount of money and level,which sets by contract`s owner
     * @param _percentOnDepth a correspondence between percent and depth level,which sets by contract`s owner
     */
    constructor(
        uint256[] memory _moneyOnLevel,
        uint256[] memory _percentOnDepth
    ) {
        moneyOnLevel = _moneyOnLevel;
        percentOnDepth = _percentOnDepth;
    }

    /**
     * @notice Function is used to get level depending of sum
     * @param sum ammount of user`s money
     * @return uint256 user`s level
     */
    function getLevelBySum(uint256 sum) external view returns (uint256) {
        uint256 i;
        for (i = 0; i < moneyOnLevel.length; i++) {
            if (sum < moneyOnLevel[i]) return i;
        }
        return i;
    }

    /**
     * @notice Function is used to get percent depending of depth level
     * @param depthLevel ammount of user`s money
     * @return uint256 user`s level
     */
    function getPercentByDepth(uint256 depthLevel)
        external
        view
        returns (uint256)
    {
        require(depthLevel > 0, "depth can only be positive");
        depthLevel--;
        if (depthLevel < percentOnDepth.length)
            return percentOnDepth[depthLevel];
        return 0;
    }

    /**
     * @dev Function is used to set a correspondence between ammount of money and level by contract`s owner
     * @param _moneyOnLevel a correspondence between ammount of money and level
     */
    function setMoneyOnLevelArray(uint256[] memory _moneyOnLevel)
        external
        onlyOwner
    {
        moneyOnLevel = _moneyOnLevel;
    }

    /**
     * @dev Function is used to set a correspondence between percent and depth level by contract`s owner
     * @param _percentOnDipth a correspondence between percent and depth level
     */
    function setPercentOnDepthArray(uint256[] memory _percentOnDipth)
        external
        onlyOwner
    {
        percentOnDepth = _percentOnDipth;
    }

    /**
     * @dev Function is used to get a correspondence between ammount of money and level by contract`s owner
     */
    function getMoneyOnLevelArray()
        external
        view
        onlyOwner
        returns (uint256[] memory)
    {
        return moneyOnLevel;
    }

    /**
     * @dev Function is used to get a correspondence between percent and depth level by contract`s owner
     */
    function getPercentOnDepthArray()
        external
        view
        onlyOwner
        returns (uint256[] memory)
    {
        return percentOnDepth;
    }
}
