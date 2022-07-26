// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

interface IMLMLevelLogic {
    function getLevelBySum(uint sum) external view returns (uint);

    function getPercentByDepth(uint s) external view returns (uint);
}
