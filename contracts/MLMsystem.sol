// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

// Import this file to use console.log
import "hardhat/console.sol";

import "contracts/interfaces/IMLMLevelLogic.sol";

contract MLMsystem {
    mapping(address => uint256) private usersAccount;
    mapping(address => address) private usersReferalAddress;
    mapping(address => address[]) private usersDirectPartners;
    IMLMLevelLogic mlmLevelLogic;

    constructor(address _mlmLevelLogic) {
        mlmLevelLogic = IMLMLevelLogic(_mlmLevelLogic);
    }

    //пять процентов на счет контракта,95 на счет пользователя
    //возможно надо проверить на выход за границы
    function investInMLM() external payable {
        usersAccount[msg.sender] =
            usersAccount[msg.sender] +
            (msg.value * 95) /
            100;
    }

    //добавляет пользователя
    function addUser() external {}

    //добавляет пользователя по рефералке
    function addUser(address usersRefender) external {
        usersReferalAddress[msg.sender] = usersRefender;
        usersDirectPartners[usersRefender].push(msg.sender);
    }

    //просто возвращает пользователю уровень
    function getUserLevel() external view returns (uint256) {
        return mlmLevelLogic.getLevelBySum(usersAccount[msg.sender]);
    }

    //возвращает количество DirrectPartners
    function getAmountOfDirrectPartners() external view returns (uint256) {
        return usersDirectPartners[msg.sender].length;
    }

    //Выводит деньги пользователя,запускает функцию рассчета и начисления коомиссии со счетов системы
    function withdrawMoney() external {
        uint256 amount = usersAccount[msg.sender];
        require(amount > 0, "not enough money");
        usersAccount[msg.sender] = 0;
        (payable(msg.sender)).transfer(amount);
        calculateCommission(amount);
    }

    //рассчет комиссии
    function calculateCommission(uint256 amount) private {
        uint256 i = 1;
        address currentAddress = usersReferalAddress[msg.sender];
        while (currentAddress != address(0)) {
            if (
                mlmLevelLogic.getLevelBySum(usersAccount[currentAddress]) >= i
            ) {
                usersAccount[currentAddress] +=
                    amount *
                    mlmLevelLogic.getPercentByDepth(i);
            }
            currentAddress = usersReferalAddress[currentAddress];
            i++;
        }
    }
}
