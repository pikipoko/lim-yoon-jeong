pragma solidity ^0.4.18;
pragma experimental ABIEncoderV2;

contract userHistoryContract {

    uint8 numberOfHistories; 
    address contractOwner;

    mapping(string => uint[]) histories;

    constructor() public {        
        contractOwner = msg.sender;
    }

    function addHistory(string userCode) public {
        uint[] history = histories[userCode];
        history.push(now);
        numberOfHistories++;
    }

    //인증이력 등록의 수를 리턴합니다.
    function getNumOfHistories() public constant returns(uint8) {
        return numberOfHistories;
    }

    //번호에 해당하는 인증이력을 리턴합니다.
    function getHistory(string userCode) public view returns (uint[]) {
        return (histories[userCode]);
    }

    //컨트랙트를 삭제합니다.
    function killContract() public {
        if(contractOwner == msg.sender)
            selfdestruct(contractOwner);
    }
}