// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";
import "./MLMLevelLogic.sol";
error insufficient__funds();

contract MLMDataBase {
    uint s_contractAccount;
    mapping(address => uint) private s_usersAccounts;
    mapping(address => address) private s_usersRefAddress;
    address[] private s_allUsers;

    //пять процентов на счет контракта,95 на счет пользователя
    //возможно надо проверить на выход за границы
    function investInMLM() public payable {
        s_contractAccount = s_contractAccount + (msg.value * 5) / 100;
        s_usersAccounts[msg.sender] =
            s_usersAccounts[msg.sender] +
            (msg.value * 95) /
            100;
    }

    //добавляет пользователя
    function addUser() external {
        s_allUsers.push(msg.sender);
    }

    //добавляет пользователя по рефералке
    function addUser(address usersRefender) external {
        s_allUsers.push(msg.sender);
        s_usersRefAddress[msg.sender] = usersRefender;
    }

    //просто возвращает пользователю уровень
    function getLevel() public view returns (uint) {
        return MLMLevelLogic.getLevelBySum(s_usersAccounts[msg.sender]);
    }

    //возвращает количество DirrectPartners(cупер пупер дорогая)
    function getAmountOfDirrectPartners() external view returns (uint) {
        uint amountOfDirrectPartners = 0;
        uint size = s_allUsers.length;
        for (uint i = 0; i < size; i++) {
            if (s_usersRefAddress[s_allUsers[i]] == msg.sender) {
                amountOfDirrectPartners++;
            }
        }
        return amountOfDirrectPartners;
    }

    //Выводит деньги пользователя,запускает функцию рассчета и начисления коомиссии со счетов системы
    function withdrawMoney() public {
        uint amount = s_usersAccounts[msg.sender];
        if (amount > 0) revert insufficient__funds();
        s_usersAccounts[msg.sender] = 0;
        (payable(msg.sender)).transfer(amount);
        calculateCommission(amount);
    }

    //рассчет комиссии
    function calculateCommission(uint amount) private {
        uint i = 1;
        address currentAddress = s_usersRefAddress[msg.sender];
        while (currentAddress != address(0)) {
            if (
                MLMLevelLogic.getLevelBySum(s_usersAccounts[currentAddress]) >=
                i
            ) {
                s_usersAccounts[currentAddress] +=
                    amount *
                    MLMLevelLogic.getPercentByDipth(i);
                s_contractAccount -=
                    (amount * MLMLevelLogic.getPercentByDipth(i)) /
                    1000;
            }
            currentAddress = s_usersRefAddress[currentAddress];
            i++;
        }
    }
}
