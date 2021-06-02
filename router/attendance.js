const etherConfig = require('../config/etherConfig');
const contractAbi = require('../public/js/contractAbi.json');
const contractAddress = etherConfig.contractAddress;
const account = etherConfig.account;
const Tx = require('ethereumjs-tx').Transaction;
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.WebsocketProvider(etherConfig.endpoint));
const privateKey = Buffer.from(etherConfig.privateKey, 'hex');
const contract = new web3.eth.Contract(contractAbi, contractAddress);
const identifyInfo = require('./indentifyInfo');

const list = (req, res) => {
    console.log('/process/list로 POST 요청됨.');

    const userCode = req.body.userCode;
    const history = getHistory(userCode);
    console.log(history);
}

const getHistory = async (userCode) => {
    let response;
    await contract.methods.getHistory(userCode).call()
        .then(history => {
            console.log("history: " + history);
            response = {
                'result': 'true',
                'getList': history
            }
        });
    
        return response;
}

const getHistoriesNumber = async () => {
    console.log("인증 이력 개수 조회를 위한 메서드 호출됨.");

    let result;
    await contract.methods.getNumOfHistories().call()
        .then(length => {
            console.log("Value before increment: " + length);
            result = length
        })
    return result;
}


const submitHistory = async (userCode, hashValue) => {
    console.log('인증 이력 저장 메서드 호출됨.');

    console.log("userCode : " + userCode + ", hashValue : " + hashValue);

    // 실전에서는 각 userCode에 해당하는 해쉬값을 가져와야 하지만 테스트용으로 전체 데이터에 대한 해쉬값 가져옴(키값: 관리자)
    const savedHashValue = await identifyInfo.getIdentifyInfo('admin');
    console.log(savedHashValue.getList + " : " + hashValue);
    if (savedHashValue.getList != hashValue) {
        console.log('해쉬값 불일치 인증정보 위변조 탐지');
        return false;
    }

    const contractFunction = contract.methods.addHistory(userCode);
    const functionAbi = contractFunction.encodeABI();

    web3.eth.getTransactionCount(account, "pending").then(_nonce => {
        const txParams = {
            nonce: web3.utils.toHex(_nonce),
            gasPrice: web3.utils.toHex(web3.utils.toWei('4', 'gwei')),
            gasLimit: web3.utils.toHex(210000),
            from: account,
            to: contractAddress,
            data: functionAbi
        };

        const tx = new Tx(txParams, { 'chain': 'ropsten' })
        tx.sign(privateKey)
        serializedTx = tx.serialize()

        try {
            web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
            .on('receipt', receipt => {
                console.log("receipt :", receipt);
                contract.methods.getNumOfHistories().call()
                    .then(length => {
                        console.log("getNumOfHistories: " + length)
                    })
                const response = {
                    'result': 'true',
                    'blockHash': receipt.blockHash,
                    'transactionHash': receipt.transactionHash,
                }

                //res.status(200).json(response);
                console.log('response : ' + response.data);
            })   // end of on('receipt')
        } catch (err) {
            console.log('가스 비용 부족 : ' + err);
        }
    })  // web3.eth.getTransactionCount

    return true;
}

const test = {};

test.send = (data) => {
    console.log('test.send 호출됨.');
    
    console.log(data);
}

module.exports = test;

module.exports.list = list;
module.exports.submitHistory = submitHistory;
module.exports.getHistory = getHistory;