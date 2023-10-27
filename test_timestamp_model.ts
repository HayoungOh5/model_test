import 'dotenv/config'
import { Mitum } from "../mitumjs/src/index";
import { setNode } from './base/nodeSetting';
import { makeNormalAccount, makeContractAccount, signAndSend } from './base/common';
import * as fs from 'fs';

const args = process.argv.slice(2);
const { node_type, node_url, test_address, test_privatekey, test_currencyID } = setNode(args);

// Log file creation, write
const logFile = `Log/test_timestamp_with_${node_type}_node_log.txt`
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


// Function for timestamp method
// createService
const createService = async (contractAddress: string, sender: string, currencyID: string, privatekey: string) => {
    const createOperation = mitum.timestamp.createService(contractAddress, sender, currencyID);
    writeLog("createOperation\n" + JSON.stringify(createOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, createOperation, wait);
}

// append timestamp
const appendTimestamp = async (contractAddress: string, sender: string, projectId: string, currencyID: string, privatekey: string) => {
    const requestTimeNumber = 6000000;
    const data = "exampleRequestDataexampleRequestDataexampleRequestData";
    const appendOperation = mitum.timestamp.append(contractAddress, sender, projectId, requestTimeNumber, data, currencyID);
    writeLog("appendOperation\n" + JSON.stringify(appendOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, appendOperation, wait);
}

// Function for timestamp GET method

// getService info (check create service)
const getServiceInfo = async (contractAddress: string) => {
    await mitum.timestamp.getServiceInfo(contractAddress).then((res) => {
        console.log(res);
        writeLog("Timestamp service Informtaion\n" + JSON.stringify(res));
    })
}

const getTimestampInfo = async (contractAddress: string, projectId: string, tid: number) => {
    await mitum.timestamp.getTimestampInfo(contractAddress, projectId, tid).then((res) => {
        console.log(res);
        writeLog(`TimestampInfo of projectID ${projectId} tid ${tid}\n` + JSON.stringify(res));
    })
}

// execute
async function main() {
    if (test_address && test_privatekey && test_currencyID) {
        const CA1 = await  makeContractAccount(mitum, test_address, test_currencyID, 50, test_privatekey, wait, writeLog);

        const contractAddress = CA1.address;

        //createSercvie
        await createService(contractAddress, test_address, test_currencyID, test_privatekey);
        await getServiceInfo(contractAddress);

        //append timestamp
        await appendTimestamp(contractAddress, test_address, "protocon1", test_currencyID, test_privatekey);
        await appendTimestamp(contractAddress, test_address, "protocon1", test_currencyID, test_privatekey);
        await appendTimestamp(contractAddress, test_address, "protocon2", test_currencyID, test_privatekey);
        await getTimestampInfo(contractAddress, "protocon1", 0);
        await getTimestampInfo(contractAddress, "protocon1", 1);
        await getTimestampInfo(contractAddress, "protocon2", 0);
    }
}

main();