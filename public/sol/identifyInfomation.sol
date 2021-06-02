pragma solidity ^0.4.18;
pragma experimental ABIEncoderV2;

contract indentifyInfoContract {

    uint8 numberOfIndentifyInfomations; 
    address contractOwner;

    mapping(string => string) indentifyInfomations;

    constructor() public {        
        contractOwner = msg.sender;
    }

    function addIdentifyInfomation(string person, string hashValue) public {
        indentifyInfomations[person] = hashValue;
        numberOfIndentifyInfomations++;
    }

    function getNumOfIndentifyInfomations() public constant returns(uint8) {
        return numberOfIndentifyInfomations;
    }

    function getIndentifyInfomation(string person) public view returns (string) {
        return (indentifyInfomations[person]);
    }

    function killContract() public {
        if(contractOwner == msg.sender)
            selfdestruct(contractOwner);
    }
}