const etherPayConfig = require('../config/etherPayConfig');
const contractPayAbi = require('../public/js/contractPayAbi.json');
const contractAddress = etherPayConfig.contractAddress;
const toAccount = etherPayConfig.toAccount;
const Tx = require('ethereumjs-tx').Transaction;
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.WebsocketProvider(etherPayConfig.endpoint));
const contract = new web3.eth.Contract(contractPayAbi, contractAddress);

// 해당 사람의 잔액 조회
const getBalance = async (fromAccount) => {
    console.log('잔액 조회 메서드 호출됨.');
    let response;
    await contract.methods.balanceOf(fromAccount).call()
        .then(balance => {
            console.log("balance : " + web3.utils.fromWei(balance, "ether") + "LYG");
            response = {
                'result': 'true',
                'getBalance': web3.utils.fromWei(balance, "ether")
            }
        });
    
        return response;
}

const transfer = async (database, code, price) => {
    console.log('결제 메서드 호출됨.');

    console.log("userCode : " + code);
    const userInfo = await getUserInfo(database, code);
    if (userInfo == null) {
        console.log('일치하는 사용자 없음.')
        return null;
    }
    console.log("user : " + userInfo);
    const fromAccount = userInfo.account;
    const privateKey = Buffer.from(userInfo.private_key, 'hex');
    console.log(privateKey);
    
    const balance = await getBalance(fromAccount);
    console.log(balance);

    if (Number(balance.getBalance) < Number(web3.utils.fromWei(price, "ether"))) {
        console.log(balance.getBalance);
        console.log(web3.utils.fromWei(price, "ether"));
        return false;
    }

    const contractFunction = contract.methods.transfer(toAccount, price);
    const functionAbi = contractFunction.encodeABI();

    web3.eth.getTransactionCount(fromAccount, "pending").then(_nonce => {
        const txParams = {
            nonce: web3.utils.toHex(_nonce),
            gasPrice: web3.utils.toHex(web3.utils.toWei('4', 'gwei')),
            gasLimit: web3.utils.toHex(210000),
            from: fromAccount,
            to: contractAddress,
            data: functionAbi
        };

        const tx = new Tx(txParams, { 'chain': 'ropsten' })
        tx.sign(privateKey)
        serializedTx = tx.serialize()

        web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
            .on('receipt', receipt => {
                console.log("receipt :", receipt);
                const response = {
                    'result': 'true',
                    'blockHash': receipt.blockHash,
                    'transactionHash': receipt.transactionHash,
                }

                console.log('response : ' + response.data);
            })   
    }) 
    return true;
}

const getUserInfo = async (database, code) => {
    console.log('유저 정보 가져오는 메서드 호출됨.');

    try {
        const conn = await database.pool.getConnection(async(conn) => conn);
        try {
            const columns = ['account', 'private_key'];
            const tableName = 'users';
            const [row] = await conn.query('select ?? from ?? where code = ?', [columns, tableName, code]);
            if (row[0]) {
                console.log(row[0]);
                return row[0];
            }
            else {
                console.log('일치하는 정보가 없습니다.');
                return null;
            }
            
        } catch (err) {
            console.log('사용자 조회 중 오류 : ' + err);
        }
        
    } catch (err) {
        console.log('데이터베이스 연결 객체 오류 : ' + err);
    }
}

module.exports.transfer = transfer;
module.exports.getBalance = getBalance;