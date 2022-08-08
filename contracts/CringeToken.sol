// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CringeToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("Cringe", "CT") {
        _mint(msg.sender, initialSupply);
    }
}
