import 'dotenv/config'
import { Mitum } from "../mitumjs/src/index";
import { setNode } from './base/nodeSetting';
import { makeNormalAccount, makeContractAccount, signAndSend } from './base/common';
import * as fs from 'fs';

const args = process.argv.slice(2);
const { node_type, node_url, test_address, test_privatekey, test_currencyID } = setNode(args);

// Log file creation, write
const logFile = `Log/test_sto_with_${node_type}_node_log.txt`
fs.writeFile(logFile, "", (err) => {if (err) {console.error('파일 생성 중 오류가 발생했습니다:', err)}});
const writeLog = (textToWrite: string) => {
    fs.appendFile(logFile, "\n" + textToWrite + "\n", (err) => {
        if (err) {
          console.error('파일을 작성하는 동안 오류가 발생했습니다:', err);
        }
    });
}

// Time to execute one operation and wait
const delay: number = 8000;
const wait = () => new Promise((resolve) => setTimeout(resolve, delay))

// set mitum node
const mitum = new Mitum(node_url as string); // node_url이 undefined가 아니라고 TypeScript에 알리기

// Function for STO method

// create STO service
const createService = async (contractAddress: string, sender: string, granularity: number, defaultPartition: string, currencyID: string, privatekey: string) => {
    interface data {
        granularity: number,
        defaultPartition: string,
    }
    
    const stoData: data = {
        granularity: granularity,
        defaultPartition : defaultPartition,
    };

    const createServiceOperation = mitum.sto.createService(contractAddress, sender, stoData, currencyID);
    writeLog("createServiceOperation\n" + JSON.stringify(createServiceOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, createServiceOperation, wait);
}

// setDocument
const setDocument = async (contractAddress: string, sender: string, currencyID: string, privatekey: string) => {
    const title = "Sto title"
    const uri = "www.protocon.com";
    const documentHash = "381yXYxtWCavzPxeUXRewT412gbLt2hx7VanKazkBrsnyfPPBdXfoG52Yb2wkF8vC3KJyoWgETpsN6k97mQ8tUXr1CmTedcj";
    const setDocumentOperation = mitum.sto.setDocument(contractAddress, sender, title, uri, documentHash, currencyID);
    writeLog("setDocumentOperation\n" + JSON.stringify(setDocumentOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, setDocumentOperation, wait);
}

// issue token
const issue = async (contractAddress: string, sender: string, receiver: string, partition:string, currencyID: string, privatekey: string) => {
    const amount = 1000;
    const issueOperation = mitum.sto.issue(contractAddress, sender, receiver, partition, amount, currencyID);
    writeLog("issueOperation\n" + JSON.stringify(issueOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, issueOperation, wait);
}

// authorize operator
const authorizeOperator = async (contractAddress: string, sender: string, operator: string, partition: string, currencyID: string, privatekey: string) => {
    const authorizeOperation = mitum.sto.authorizeOperator(contractAddress, sender, operator, partition, currencyID);
    writeLog("authorizeOperation\n" + JSON.stringify(authorizeOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, authorizeOperation, wait);
}

// revoke operator
const revokeOperator = async (contractAddress: string, sender: string, operator: string, partition: string, currencyID: string, privatekey: string) => {
    const revokeOperation = mitum.sto.revokeOperator(contractAddress, sender, operator, partition, currencyID);
    writeLog("revokeOperation\n" + JSON.stringify(revokeOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, revokeOperation, wait);
}

// transfer by partition
const transferByPartition = async (contractAddress: string, sender: string, holder: string, receiver: string, partition: string, currencyID: string, privatekey: string) => {
    const amount = 777;
    const transferOperation = mitum.sto.transferByPartition(contractAddress, sender, holder, receiver, partition, amount, currencyID);
    writeLog("transferOperation\n" + JSON.stringify(transferOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, transferOperation, wait);
}

// redeem
const redeem = async (contractAddress: string, sender: string, tokenHolder: string, partition: string, currencyID: string, privatekey: string) => {
    const amount = 200;
    const redeemOperation = mitum.sto.redeem(contractAddress, sender, tokenHolder, partition, amount, currencyID);
    writeLog("redeemOperation\n" + JSON.stringify(redeemOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, redeemOperation, wait);
}

// Function for STO GET method

// get STO Service info
const getServiceInfo = async (contractAddress: string) => {
    await mitum.sto.getServiceInfo(contractAddress).then((res) => {
        console.log(res);
        writeLog("STO service Informtaion\n" + JSON.stringify(res));
    })
}

const getPartitionsInfo = async (contractAddress: string, holder: string) => {
    await mitum.sto.getPartitionsInfo(contractAddress, holder).then((res) => {
        console.log(res);
        writeLog(`getPartitionsInfo by holder ${holder}\n` + JSON.stringify(res));
    })
}


const getBalanceByHolder = async (contractAddress: string, holder: string, partition: string) => {
    await mitum.sto.getBalanceByHolder(contractAddress, holder, partition).then((res) => {
        console.log(res);
        writeLog(`getBalanceByHolder partition ${partition}, ${holder}\n` + JSON.stringify(res));
    })
}

const getOperatorsByHolder = async (contractAddress: string, holder: string, partition: string) => {
    await mitum.sto.getOperatorsByHolder(contractAddress, holder, partition).then((res) => {
        console.log(res);
        writeLog(`getOperatorsByHolder partition ${partition}, ${holder}\n` + JSON.stringify(res));
    })
}

const getPartitionBalanceInfo = async (contractAddress: string, partition: string) => {
    await mitum.sto.getPartitionBalanceInfo(contractAddress, partition).then((res) => {
        console.log(res);
        writeLog(`getPartitionBalanceInfo ${partition}\n` + JSON.stringify(res));
    })
}

const getAuthorizedInfo = async (contractAddress: string, operator: string) => {
    await mitum.sto.getAuthorizedInfo(contractAddress, operator).then((res) => {
        console.log(res);
        writeLog(`getAuthorizedInfo of ${operator}\n` + JSON.stringify(res));
    })
}

// updateOperator
const updateOperator = async (contractAddress: string, sender: string, operators: string[], currencyID: string, privatekey: string) => {
    const updateOperation = mitum.contract.updateOperator(sender, contractAddress, currencyID, operators);
    writeLog("updateOperation\n" + JSON.stringify(updateOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, updateOperation, wait);
}

// execute
async function main() {
    if (test_address && test_privatekey && test_currencyID) {
        const NA1 = await makeNormalAccount(mitum, test_address, test_currencyID, 50, test_privatekey, wait, writeLog);
        const NA2 = await makeNormalAccount(mitum, test_address, test_currencyID, 50, test_privatekey, wait, writeLog);
        const CA1 = await  makeContractAccount(mitum, test_address, test_currencyID, 50, test_privatekey, wait, writeLog);

        const contractAddress = CA1.address;

        // update operator
        // await updateOperator(contractAddress, test_address, [NA1.address], test_currencyID, test_privatekey);

        //create STO service
        await createService(contractAddress, test_address, 1, "ABCD", test_currencyID, test_privatekey);
        await setDocument(contractAddress, test_address, test_currencyID, test_privatekey);
        await getServiceInfo(contractAddress);

        //issue
        await issue(contractAddress, test_address, test_address, "EFGH", test_currencyID, test_privatekey);
        await issue(contractAddress, test_address, test_address, "ABCD", test_currencyID, test_privatekey);
        await issue(contractAddress, test_address, NA1.address, "ABCD", test_currencyID, test_privatekey);
        await getServiceInfo(contractAddress);
        await getPartitionBalanceInfo(contractAddress, "EFGH");
        await getPartitionBalanceInfo(contractAddress, "ABCD");

        //authorizeOperator
        await authorizeOperator(contractAddress, test_address, NA1.address, "ABCD", test_currencyID, test_privatekey);
        await getOperatorsByHolder(contractAddress, test_address, "ABCD");

        await authorizeOperator(contractAddress, NA1.address, NA2.address, "ABCD", test_currencyID, NA1.privatekey);
        await getAuthorizedInfo(contractAddress, NA1.address);
        await getAuthorizedInfo(contractAddress, NA2.address);

        // revokeOperator
        await revokeOperator(contractAddress, NA1.address, NA2.address, "ABCD", test_currencyID, NA1.privatekey);

        //transferByPartition
        await transferByPartition(contractAddress, NA1.address, NA1.address, NA2.address, "ABCD", test_currencyID, NA1.privatekey);        
        await getBalanceByHolder(contractAddress, NA1.address, "ABCD");
        await getBalanceByHolder(contractAddress, NA2.address, "ABCD");
        await getBalanceByHolder(contractAddress, test_address, "EFGH");

        // redeem
        await redeem(contractAddress, test_address, test_address, "EFGH", test_currencyID, test_privatekey);
        await getServiceInfo(contractAddress);
        await getBalanceByHolder(contractAddress, test_address, "EFGH");
        await getPartitionsInfo(contractAddress, test_address);
        await getPartitionBalanceInfo(contractAddress, "EFGH");
    }
}

main();