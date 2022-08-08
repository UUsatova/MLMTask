// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

import "contracts/interfaces/IMLMLevelLogic.sol";
import "contracts/MLMLevelLogic.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @author UUsatova
 */
contract MLMsystem is Initializable {
    IERC20 private currentToken;
    mapping(address => uint256) private usersAccount;
    mapping(address => address) private usersReferalAddress;
    mapping(address => address[]) private usersDirectPartners;
    address private mlmLevelLogic;

    /**
     * @dev proxy use this function for contract initialization
     * @param _mlmLevelLogic  - address of contract with actual level logic
     * @param _currentToken  - address of contract with actual token
     */
    function initialize(address _mlmLevelLogic, address _currentToken)
        public
        initializer
    {
        mlmLevelLogic = _mlmLevelLogic;
        currentToken = IERC20(_currentToken);
    }

    /**
     * @notice adds a user to the system
     */
    function addUser() external pure {}

    /**
     * @notice adds a user to the system using the address of the person who invited him
     * @param usersRefender address оf the person who invited him
     */
    function addUser(address usersRefender) external {
        usersReferalAddress[msg.sender] = usersRefender;
        usersDirectPartners[usersRefender].push(msg.sender);
    }

    /**
     
     * @notice deposits 95 percent of the amount sent to the user's account
     */
    function investInMLM(uint256 amount) external {
        require(amount > 0, "You need to sell at least some tokens");
        uint256 allowance = currentToken.allowance(msg.sender, address(this));
        require(allowance >= amount, "Check the token allowance");
        currentToken.transferFrom(msg.sender, address(this), amount);

        usersAccount[msg.sender] =
            usersAccount[msg.sender] +
            (amount * 95) /
            100;
    }

    /**
     * @notice when this function is called, the user debits all his  CringeToken from his account on
     *          the contract. Tokens are transferred to his personal account
     */
    function withdrawMoney() external {
        uint256 amount = usersAccount[msg.sender];
        require(amount > 0, "not enough money");
        usersAccount[msg.sender] = 0;
        bool sent = currentToken.transfer(msg.sender, amount);
        require(sent, "Failed to send user balance back to the user");
        calculateCommission(amount);
    }

    /**
     * @dev the function performs the calculation and accrual of commission after the withdrawal of a
     *      certain amount by the user. The commission is charged to users linked to each other by referral
     *      links
     * @param amount the amount of money written off by the user
     */
    function calculateCommission(uint256 amount) private {
        uint256 i = 1;
        address currentAddress = usersReferalAddress[msg.sender];
        while (currentAddress != address(0)) {
            if (
                IMLMLevelLogic(mlmLevelLogic).getLevelBySum(
                    usersAccount[currentAddress]
                ) >= i
            ) {
                usersAccount[currentAddress] +=
                    (amount *
                        IMLMLevelLogic(mlmLevelLogic).getPercentByDepth(i)) /
                    1000;
            }
            currentAddress = usersReferalAddress[currentAddress];
            i++;
        }
    }

    /**
     * @return users' level
     */
    function getUserLevel() external view returns (uint256) {
        return
            MLMLevelLogic(mlmLevelLogic).getLevelBySum(
                usersAccount[msg.sender]
            );
    }

    /**
     * @return amount of users' dirrect partners
     */
    function getAmountOfDirrectPartners() external view returns (uint256) {
        return usersDirectPartners[msg.sender].length;
    }

    /**
     * @return users' referal address
     */
    function getUserReferalAddress() external view returns (address) {
        return usersReferalAddress[msg.sender];
    }

    /**
     * @return users' current account
     */
    function getUserAccount() external view returns (uint256) {
        return usersAccount[msg.sender];
    }
}
