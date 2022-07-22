// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

// Import this file to use console.log
import "hardhat/console.sol";
import "./MLMLevelLogicInterface.sol";

contract MLMsistem {
    mapping(address => uint) private usersAccounts;
    mapping(address => address) private usersRefAddress;
    mapping(address => address[]) private usersDirPartner;
    MLMLevelLogicInterface mlmLevelLogic;

    constructor(address _mlmLevelLogic) {
        mlmLevelLogic = MLMLevelLogicInterface(_mlmLevelLogic);
    }

    //пять процентов на счет контракта,95 на счет пользователя
    //возможно надо проверить на выход за границы
    function investInMLM() public payable {
        usersAccounts[msg.sender] =
            usersAccounts[msg.sender] +
            (msg.value * 95) /
            100;
    }

    //добавляет пользователя
    function addUser() external {}

    //добавляет пользователя по рефералке
    function addUser(address usersRefender) external {
        usersRefAddress[msg.sender] = usersRefender;
        usersDirPartner[usersRefender].push(msg.sender);
    }

    //просто возвращает пользователю уровень
    function getLevel() public view returns (uint) {
        return mlmLevelLogic.getLevelBySum(usersAccounts[msg.sender]);
    }

    //возвращает количество DirrectPartners
    function getAmountOfDirrectPartners() external view returns (uint) {
        return usersDirPartner[msg.sender].length;
    }

    //Выводит деньги пользователя,запускает функцию рассчета и начисления коомиссии со счетов системы
    function withdrawMoney() public {
        uint amount = usersAccounts[msg.sender];
        require(amount > 0, "not enough money");
        usersAccounts[msg.sender] = 0;
        (payable(msg.sender)).transfer(amount);
        calculateCommission(amount);
    }

    //рассчет комиссии
    function calculateCommission(uint amount) private {
        uint i = 1;
        address currentAddress = usersRefAddress[msg.sender];
        while (currentAddress != address(0)) {
            if (
                mlmLevelLogic.getLevelBySum(usersAccounts[currentAddress]) >= i
            ) {
                usersAccounts[currentAddress] +=
                    amount *
                    mlmLevelLogic.getPercentByDipth(i);
            }
            currentAddress = usersRefAddress[currentAddress];
            i++;
        }
    }
}
