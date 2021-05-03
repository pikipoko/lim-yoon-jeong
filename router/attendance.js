const etherConfig = require('../config/etherConfig');
const contractAbi = require('../public/js/contractAbi.json');
const contractAddress = etherConfig.contractAddress
const account = etherConfig.account
const Tx = require('ethereumjs-tx').Transaction
const Web3 = require('web3')
const web3 = new Web3('https://ropsten.infura.io/v3/3c52917848e945229c0d33d632b10490')
const privateKey = Buffer.from(etherConfig.privateKey, 'hex')
const contract = new web3.eth.Contract(abi, contractAddress)
const bodyParser = require('body-parser')

const submit = (req, res) => {
    console.log('/process/submit으로 POST 요청됨.');
}

module.exports.submit = submit;