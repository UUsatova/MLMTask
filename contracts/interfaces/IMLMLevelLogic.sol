// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

interface IMLMLevelLogic {
    function getLevelBySum(uint256 sum) external view returns (uint256);

    function getPercentByDepth(uint256 s) external view returns (uint256);
}
