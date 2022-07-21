pragma solidity ^0.8.9;

library MLMLevelLogic {
    function getLevelBySum(uint sum) external pure returns (uint) {
        if (sum < 5000000000000000) return 0;
        else if (sum < 10000000000000000) return 1;
        else if (sum < 20000000000000000) return 2;
        else if (sum < 50000000000000000) return 3;
        else if (sum < 100000000000000000) return 4;
        else if (sum < 200000000000000000) return 5;
        else if (sum < 500000000000000000) return 6;
        else if (sum < 1000000000000000000) return 7;
        else if (sum < 2000000000000000000) return 8;
        else if (sum < 5000000000000000000) return 10;
        else return 10;
    }

    function getPercentByDipth(uint i) external pure returns (uint) {
        if (i == 1) return 10;
        if (i == 2) return 7;
        if (i == 3) return 5;
        if (i == 4) return 2;
        else {
            return 1;
        }
    }
}
