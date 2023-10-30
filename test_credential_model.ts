import 'dotenv/config'
import { Mitum } from "../mitumjs/src/index";
import { setNode } from './base/nodeSetting';
import { makeNormalAccount, makeContractAccount, signAndSend } from './base/common';
import * as fs from 'fs';

const args = process.argv.slice(2);
const { node_type, node_url, test_address, test_privatekey, test_currencyID } = setNode(args);

// Log file creation, write
const logFile = `Log/test_credential_with_${node_type}_node_log.txt`
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


// Function for credential method
// createService
const createService = async (contractAddress: string, sender: string, currencyID: string, privatekey: string) => {
    const createOperation = mitum.credential.createService(contractAddress, sender, currencyID);
    writeLog("createOperation\n" + JSON.stringify(createOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, createOperation, wait);
}

// append credential
const addTemplate = async (contractAddress: string, sender: string, templateID: string, currencyID: string, privatekey: string) => {
    const templateData = {
		templateID: templateID,
        templateName: "default",
        serviceDate: "2023-10-12",
        expirationDate: "2023-12-31",
        templateShare: true,
        multiAudit: false,
        displayName: "SITcredentials",
        subjectKey: "SITdevcredential",
        description: "proofofdev",
        creator: sender,
    };
    const appendOperation = mitum.credential.addTemplate(contractAddress, sender, templateData, currencyID);
    writeLog("appendOperation\n" + JSON.stringify(appendOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, appendOperation, wait);
}

const issue = async (contractAddress: string, sender: string, holder: string, templateID: string, id: string, currencyID: string, privatekey: string) => {
    const issueData = {
        holder: holder,
        templateID: templateID,
        id: id,
        value: "sefthia200",
        validFrom: 100,
        validUntil: 200,
        did: "sefthia300",
    };
    const issueOperation = mitum.credential.issue(contractAddress, sender, issueData, currencyID);
    writeLog("issueOperation\n" + JSON.stringify(issueOperation.toHintedObject()));
    const signedOp = mitum.operation.sign(privatekey, issueOperation);
    await signAndSend(mitum, privatekey, issueOperation, wait);
}

const revoke = async (contractAddress: string, sender: string, holder: string, templateID: string, id: string, currencyID: string, privatekey: string) => {
    const revokeOperation = mitum.credential.revoke(
		contractAddress,
		sender,
		holder,
		templateID,
		id,
		currencyID,
    );
    writeLog("revokeOperation\n" + JSON.stringify(revokeOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, revokeOperation, wait);
}

// Function for credential GET method

// getService info (check create service)
const getServiceInfo = async (contractAddress: string) => {
    await mitum.credential.getServiceInfo(contractAddress).then((res) => {
        console.log(res);
        writeLog("Service Informtaion\n" + JSON.stringify(res));
    })
}

const getTemplate = async (contractAddress: string, templateID: string) => {
    await mitum.credential.getTemplate(contractAddress, templateID).then((res) => {
        console.log(res);
        writeLog("template Informtaion\n" + JSON.stringify(res));
    })
}

const getCredentialInfo = async (contractAddress: string, templateID: string, credentialID: string) => {
    await mitum.credential.getCredentialInfo(contractAddress, templateID, credentialID).then((res) => {
        console.log(res);
        writeLog(`credentialInfo of templateID ${templateID} credentialID ${credentialID}\n` + JSON.stringify(res));
    })
}

const getAllCredentials = async (contractAddress: string, templateID: string) => {
    await mitum.credential.getAllCredentials(contractAddress, templateID).then((res) => {
        console.log(res);
        writeLog(`All credential of templateID ${templateID}\n` + JSON.stringify(res));
    })
}

const claimCredential = async (contractAddress: string, holder: string) => {
    await mitum.credential.claimCredential(contractAddress, holder).then((res) => {
        console.log(res);
        writeLog(`claim credential of holder ${holder}\n` + JSON.stringify(res));
    })
}

// execute
async function main() {
    if (test_address && test_privatekey && test_currencyID) {
        const NA1 = await makeNormalAccount(mitum, test_address, test_currencyID, 50, test_privatekey, wait, writeLog);
        const NA2 = await makeNormalAccount(mitum, test_address, test_currencyID, 50, test_privatekey, wait, writeLog);
        const CA1 = await makeContractAccount(mitum, test_address, test_currencyID, 50, test_privatekey, wait, writeLog);

        const contractAddress = CA1.address;

        //createSercvie
        await createService(contractAddress, test_address, test_currencyID, test_privatekey);
        await getServiceInfo(contractAddress);

        //add template
        const addTemplateID1 = "testTemplate";
        await addTemplate(contractAddress, test_address, addTemplateID1, test_currencyID, test_privatekey);
        await getTemplate(contractAddress, addTemplateID1);

        // issue
        const credentialID = "testCredential";
        await issue(contractAddress, test_address, NA1.address, addTemplateID1, credentialID, test_currencyID, test_privatekey);
        await claimCredential(contractAddress, NA1.address);

        // revoke
        await revoke(contractAddress, test_address, NA1.address, addTemplateID1, credentialID, test_currencyID, test_privatekey);
        await getCredentialInfo(contractAddress, addTemplateID1, credentialID);
        await claimCredential(contractAddress, NA1.address);

        //issue with revoked credentialID to different holder
        await issue(contractAddress, test_address, NA2.address, addTemplateID1, credentialID, test_currencyID, test_privatekey);
        await getCredentialInfo(contractAddress, addTemplateID1, credentialID);
        await claimCredential(contractAddress, NA2.address);

        //issue with another credentialID to same holder
        const credentialID2 = "testCredential2";
        await issue(contractAddress, test_address, NA1.address, addTemplateID1, credentialID2, test_currencyID, test_privatekey);
        await claimCredential(contractAddress, NA1.address);
        await getAllCredentials(contractAddress, addTemplateID1);

        //add another template
        const addTemplateID2 = "testTemplate2";
        await addTemplate(contractAddress, test_address, addTemplateID2, test_currencyID, test_privatekey);
        await getTemplate(contractAddress, addTemplateID2);

        // issue 
        await issue(contractAddress, test_address, NA2.address, addTemplateID2, credentialID, test_currencyID, test_privatekey);
        await getAllCredentials(contractAddress, addTemplateID2);
    }
}

main();