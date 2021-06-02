const etherIdentifyConfig = require('../config/etherIdentifyConfig');
const contractIdentifyAbi = require('../public/js/contractIdentifyAbi.json');
const contractAddress = etherIdentifyConfig.contractAddress;
const account = etherIdentifyConfig.account;
const Tx = require('ethereumjs-tx').Transaction;
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.WebsocketProvider(etherIdentifyConfig.endpoint));
const privateKey = Buffer.from(etherIdentifyConfig.privateKey, 'hex');
const contract = new web3.eth.Contract(contractIdentifyAbi, contractAddress);

const getIdentifyInfo = async (person) => {
    let response;
    await contract.methods.getIndentifyInfomation(person).call()
        .then(identifyInfo => {
            console.log("identifyInfo: " + identifyInfo);
            response = {
                'result': 'true',
                'getList': identifyInfo
            }
        });
    
        return response;
}

const getIdentifyInfoNumber = async () => {
    console.log("인증 데이터에 대한 해쉬값 개수 조회를 위한 메서드 호출됨.");

    let result;
    await contract.methods.getNumOfIndentifyInfomations().call()
        .then(length => {
            console.log("identifyInfoNumber: " + length);
            result = length
        })
    return result;
}


const submitIdentifyInfo = async (person, hashValue) => {
    console.log('인증 데이터에 대한 해쉬값 저장 메서드 호출됨.');

    console.log("person : " +  person);

    const contractFunction = contract.methods.addIdentifyInfomation(person, hashValue);
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
                const response = {
                    'result': 'true',
                    'blockHash': receipt.blockHash,
                    'transactionHash': receipt.transactionHash,
                }

                console.log('response : ' + response.data);
            })   // end of on('receipt')
        } catch (err) {
            console.log('가스 비용 부족 : ' + err);
        }
    })  // web3.eth.getTransactionCount
}

module.exports.submitIdentifyInfo = submitIdentifyInfo;
module.exports.getIdentifyInfo = getIdentifyInfo;