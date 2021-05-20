const etherConfig = require('../config/etherConfig');
const contractAbi = require('../public/js/contractAbi.json');
const contractAddress = etherConfig.contractAddress;
const account = etherConfig.account;
const Tx = require('ethereumjs-tx').Transaction;
const Web3 = require('web3');
const web3 = new Web3('https://ropsten.infura.io/v3/3c52917848e945229c0d33d632b10490');
const privateKey = Buffer.from(etherConfig.privateKey, 'hex');
const contract = new web3.eth.Contract(contractAbi, contractAddress);

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

const submit = async (req, res) => {
    console.log('/process/submit으로 POST 요청됨.');

    const userCode = req.body.userCode;
    console.log("userCode : " + userCode);

    let historyNumber = await getHistoriesNumber();
    console.log(historyNumber + " -> " + userCode);
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
    })  // web3.eth.getTransactionCount
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

const test = {};

test.send = (data) => {
    console.log('test.send 호출됨.');
    
    console.log(data);
}

module.exports = test;

module.exports.list = list;
module.exports.submit = submit;
module.exports.getHistory = getHistory;