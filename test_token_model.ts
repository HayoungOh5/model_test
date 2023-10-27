import 'dotenv/config'
import { Mitum } from "../mitumjs/src/index";
import { setNode } from './base/nodeSetting';
import { makeNormalAccount, makeContractAccount, signAndSend } from './base/common';
import * as fs from 'fs';

const args = process.argv.slice(2);
const { node_type, node_url, test_address, test_privatekey, test_currencyID } = setNode(args);

// Log file creation, write
const logFile = `Log/test_token_with_${node_type}_node_log.txt`
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

// Function for Token method
// register token
const registerToken = async (contractAddress: string, sender: string, currencyID: string, privatekey: string) => {
    const name = "ABC_TOKEN";
    const symbol = "ABC";
    const initialSupply = 100000;
    const registOperation = mitum.token.registerToken(contractAddress, sender, currencyID, name, symbol,initialSupply);
    writeLog("registOperation\n" + JSON.stringify(registOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, registOperation, wait);
}

// mint token
const mintToken = async (contractAddress: string, sender: string, reciever: string, currencyID: string, privatekey: string) => {
    const amount = 30000;
    const mintOperation = mitum.token.mint(contractAddress, sender, currencyID, reciever, amount);
    writeLog("mintOperation\n" + JSON.stringify(mintOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, mintOperation, wait);
}

// burn token
const burnToken = async (contractAddress: string, sender: string, target: string, currencyID: string, privatekey: string) => {
    const amount = 3000;
    const burnOperation = mitum.token.burn(contractAddress, sender, currencyID, target, amount);
    writeLog("targetOperation\n" + JSON.stringify(burnOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, burnOperation, wait);
}

// transfer token
const transferToken = async (contractAddress: string, sender: string, reciever: string, currencyID: string, privatekey: string) => {
    const amount = 777;
    const transferOperation = mitum.token.transfer(contractAddress, sender, currencyID, reciever, amount);
    writeLog("transferOperation\n" + JSON.stringify(transferOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, transferOperation, wait);
}

// approve token
const approveToken = async (contractAddress: string, sender: string, target: string, currencyID: string, privatekey: string) => {
    const amount = 555;
    const approveOperation = mitum.token.approve(contractAddress, sender, currencyID, target, amount);
    writeLog("approveOperation\n" + JSON.stringify(approveOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, approveOperation, wait);
}

// transferFrom token
const transferFromToken = async (contractAddress: string, sender: string, reciever: string, target: string, currencyID: string, privatekey: string) => {
    const amount = 222;
    const transferFromOperation = mitum.token.transferFrom(contractAddress, sender, currencyID, reciever, target, amount);
    writeLog("transferFromOperation\n" + JSON.stringify(transferFromOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, transferFromOperation, wait);
}

// Function for Token GET method

// get token info (check register token)
const getTokenInfo = async (contractAddress: string) => {
    await mitum.token.getTokenInfo(contractAddress).then((res) => {
        console.log(res);
        writeLog("Token Informtaion\n" + JSON.stringify(res));
    })
}

const getTokenBalance = async (contractAddress: string, owner: string) => {
    await mitum.token.getTokenBalance(contractAddress, owner).then((res) => {
        console.log(res);
        writeLog(`Token balance of ${owner}\n` + JSON.stringify(res));
    })
}

const getAllowance = async (contractAddress: string, owner: string, spender: string) => {
    await mitum.token.getAllowance(contractAddress, owner, spender).then((res) => {
        console.log(res);
        writeLog(`Approved token balance by ${owner}\n` + JSON.stringify(res));
    })
}

// execute
async function main() {
    if (test_address && test_privatekey && test_currencyID) {
        const NA1 = await makeNormalAccount(mitum, test_address, test_currencyID, 50, test_privatekey, wait, writeLog);
        const NA2 = await makeNormalAccount(mitum, test_address, test_currencyID, 50, test_privatekey, wait, writeLog);
        const CA1 = await  makeContractAccount(mitum, test_address, test_currencyID, 50, test_privatekey, wait, writeLog);

        const contractAddress = CA1.address;

        //register test
        await registerToken(contractAddress, test_address, test_currencyID, test_privatekey);
        await getTokenInfo(contractAddress);

        //mint test
        await mintToken(contractAddress, test_address, NA1.address, test_currencyID, test_privatekey);
        await getTokenBalance(contractAddress, NA1.address);
        
        //transfer test
        await transferToken(contractAddress, test_address, NA1.address, test_currencyID, test_privatekey);
        await getTokenBalance(contractAddress, NA1.address);

        //approve test
        await approveToken(contractAddress, test_address, NA1.address, test_currencyID, test_privatekey);
        await getAllowance(contractAddress, test_address, NA1.address);

        //transferFrom test
        await transferFromToken(contractAddress, NA1.address, NA2.address, test_address, test_currencyID, NA1.privatekey);
        await getAllowance(contractAddress, test_address, NA1.address);
        
        //burn
        await burnToken(contractAddress, test_address, test_address, test_currencyID, test_privatekey);
        await getTokenInfo(contractAddress);
    }
}

main();