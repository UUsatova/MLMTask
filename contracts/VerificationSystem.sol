import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

import "hardhat/console.sol";

struct Transaction {
    address from;
    uint256 value;
    bytes data;
}

contract VerificationSystem is EIP712 {
    constructor(string memory name, string memory version)
        EIP712(name, version)
    {}

    using ECDSA for bytes32;

    bytes32 private constant _TYPEHASH =
        keccak256("Transaction(address from,uint256 value,bytes data)");

    function verify(Transaction calldata req, bytes calldata signature)
        public
        view
        returns (bool)
    {
        address signer = _hashTypedDataV4(
            // this function returns the hash of the fully encoded EIP712 message for this domain.
            keccak256(
                abi.encode(_TYPEHASH, req.from, req.value, keccak256(req.data)) //кодирует данные
            )
        ).recover(signature);
        return signer == req.from;
    }
}
