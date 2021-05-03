pragma solidity ^0.4.18;
pragma experimental ABIEncoderV2;

contract userHistoryContract {

    uint8 numberOfHistories; // 총 인증이력 수입니다.
    address contractOwner;

    struct myStruct {
        uint   historyNumber;
        string userCode;
        string userName;
        uint timestamp;
    }

    myStruct[] public histories;

    constructor() public {        
        contractOwner = msg.sender;
    }

    function addProStru (uint historyNumber, string userCode, string userName) public {
        histories.push(myStruct(historyNumber, userCode, userName, now)) -1;
        numberOfHistories++;
    }

    //인증이력 등록의 수를 리턴합니다.
    function getNumOfHistories() public constant returns(uint8) {
        return numberOfHistories;
    }
    
    function getAllHistories() public view returns (myStruct[]) {
        return histories;
    }

    //번호에 해당하는 인증이력을 리턴합니다.
    function getHistoryStruct(uint _index) public view returns (uint, string, string, uint) {
        return (histories[_index].historyNumber, histories[_index].userCode, histories[_index].userName, histories[_index].timestamp);
    }

    //컨트랙트를 삭제합니다.
    function killContract() public {
        if(contractOwner == msg.sender)
            selfdestruct(contractOwner);
    }
}