import 'dotenv/config'
import { Mitum } from "../mitumjs/src/index";
import { setNode } from './base/nodeSetting';
import { makeNormalAccount, makeContractAccount, signAndSend } from './base/common';
import * as fs from 'fs';

const args = process.argv.slice(2);
const { node_type, node_url, test_address, test_privatekey, test_currencyID } = setNode(args);

// Log file creation, write
const logFile = `Log/test_point_with_${node_type}_node_log.txt`
fs.writeFile(logFile, "", (err) => {if (err) {console.error('파일 생성 중 오류가 발생했습니다:', err)}});
const writeLog = (textToWrite: string) => {
    fs.appendFile(logFile, "\n" + textToWrite + "\n", (err) => {
        if (err) {
          console.error('파일을 작성하는 동안 오류가 발생했습니다:', err);
        }
    });
}

// Time to execute one operation and wait
const delay: number = 9000;
const wait = () => new Promise((resolve) => setTimeout(resolve, delay))

// set mitum node
const mitum = new Mitum(node_url as string); // node_url이 undefined가 아니라고 TypeScript에 알리기

// Function for Point method
// register Point
const registerPoint = async (contractAddress: string, sender: string, currencyID: string, privatekey: string) => {
    const name = "ABC_Point";
    const symbol = "ABC";
    const initialSupply = 100000;
    const registOperation = mitum.point.registerPoint(contractAddress, sender, currencyID, name, symbol,initialSupply);
    writeLog("registOperation\n" + JSON.stringify(registOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, registOperation, wait);
}

// mint Point
const mintPoint = async (contractAddress: string, sender: string, reciever: string, currencyID: string, privatekey: string) => {
    const amount = 30000;
    const mintOperation = mitum.point.mint(contractAddress, sender, currencyID, reciever, amount);
    writeLog("mintOperation\n" + JSON.stringify(mintOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, mintOperation, wait);
}

// burn Point
const burnPoint = async (contractAddress: string, sender: string, target: string, currencyID: string, privatekey: string) => {
    const amount = 88;
    const burnOperation = mitum.point.burn(contractAddress, sender, currencyID, target, amount);
    writeLog("targetOperation\n" + JSON.stringify(burnOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, burnOperation, wait);
}

// transfer Point
const transferPoint = async (contractAddress: string, sender: string, reciever: string, currencyID: string, privatekey: string) => {
    const amount = 777;
    const transferOperation = mitum.point.transfer(contractAddress, sender, currencyID, reciever, amount);
    writeLog("transferOperation\n" + JSON.stringify(transferOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, transferOperation, wait);
}

// approve Point
const approvePoint = async (contractAddress: string, sender: string, target: string, currencyID: string, privatekey: string) => {
    const amount = 555;
    const approveOperation = mitum.point.approve(contractAddress, sender, currencyID, target, amount);
    writeLog("approveOperation\n" + JSON.stringify(approveOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, approveOperation, wait);
}
const approvePointCancel = async (contractAddress: string, sender: string, target: string, currencyID: string, privatekey: string) => {
    const amount = 0;
    const approveOperation = mitum.point.approve(contractAddress, sender, currencyID, target, amount);
    writeLog("cancel approveOperation\n" + JSON.stringify(approveOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, approveOperation, wait);
}

// transferFrom Point
const transferFromPoint = async (contractAddress: string, sender: string, reciever: string, target: string, currencyID: string, privatekey: string) => {
    const amount = 222;
    const transferFromOperation = mitum.point.transferFrom(contractAddress, sender, currencyID, reciever, target, amount);
    writeLog("transferFromOperation\n" + JSON.stringify(transferFromOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, transferFromOperation, wait);
}

// Function for Point GET method

// get Point info (check register Point)
const getPointInfo = async (contractAddress: string) => {
    await mitum.point.getPointInfo(contractAddress).then((res) => {
        console.log(res);
        writeLog("Point Informtaion\n" + JSON.stringify(res));
    })
}

const getPointBalance = async (contractAddress: string, owner: string) => {
    await mitum.point.getPointBalance(contractAddress, owner).then((res) => {
        console.log(res);
        writeLog(`Point balance of ${owner}\n` + JSON.stringify(res));
    })
}

const getAllowance = async (contractAddress: string, owner: string, spender: string) => {
    await mitum.point.getAllowance(contractAddress, owner, spender).then((res) => {
        console.log(res);
        writeLog(`Approved Point balance by ${owner}\n` + JSON.stringify(res));
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
        await registerPoint(contractAddress, test_address, test_currencyID, test_privatekey);
        await getPointInfo(contractAddress);

        //mint test
        await mintPoint(contractAddress, test_address, NA1.address, test_currencyID, test_privatekey);
        await getPointBalance(contractAddress, NA1.address);
        
        //transfer test
        await transferPoint(contractAddress, test_address, NA1.address, test_currencyID, test_privatekey);
        await getPointBalance(contractAddress, NA1.address);

        //approve test
        await approvePoint(contractAddress, test_address, NA1.address, test_currencyID, test_privatekey);
        await getAllowance(contractAddress, test_address, NA1.address);

        //transferFrom test
        await transferFromPoint(contractAddress, NA1.address, NA2.address, test_address, test_currencyID, NA1.privatekey);
        await getAllowance(contractAddress, test_address, NA1.address);
        
        //burn
        await burnPoint(contractAddress, test_address, test_address, test_currencyID, test_privatekey);
        await getPointInfo(contractAddress);

        // approve cancel test
        await approvePointCancel(contractAddress, test_address, NA1.address, test_currencyID, test_privatekey);
        await getPointInfo(contractAddress);
        await getAllowance(contractAddress, test_address, NA1.address);
    }
}

main();