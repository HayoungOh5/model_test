import 'dotenv/config'
import { Mitum } from "../mitumjs/src/index";
import { setNode } from './base/nodeSetting';
import { CryptoProposal, BizProposal } from "../mitumjs/src/operation/dao/proposal"
import { makeNormalAccount, makeContractAccount, signAndSend } from './base/common';
import * as fs from 'fs';

const args = process.argv.slice(2);
const { node_type, node_url, test_address, test_privatekey, test_currencyID } = setNode(args);

// Log file creation, write
const logFile = `Log/test_dao_with_${node_type}_node_log.txt`
fs.writeFile(logFile, "", (err) => {if (err) {console.error('파일 생성 중 오류가 발생했습니다:', err)}});
const writeLog = (textToWrite: string) => {
    fs.appendFile(logFile, "\n" + textToWrite + "\n", (err) => {
        if (err) {
          console.error('파일을 작성하는 동안 오류가 발생했습니다:', err);
        }
    });
}

// Time to execute one operation and wait
const delay: number = 10000;
const wait = () => new Promise((resolve) => setTimeout(resolve, delay));

const waitWithLog = async (totalDelay: number) => {
  const totalPercentage = 100;
  const wait2 = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay));
  for (let percentage = 10; percentage <= totalPercentage; percentage += 10) {
    await wait2(totalDelay/10);
    
    console.log(`Waited for ${percentage}%`);
  }
};


// set mitum node
const mitum = new Mitum(node_url as string); // node_url이 undefined가 아니라고 TypeScript에 알리기


// Function for DAO method
// createService
const createService = async (contractAddress: string, sender: string, option: "crypto" | "biz", whiteAccount: string, period: number, currencyID: string, privatekey: string) => {
    const whitelist = [whiteAccount];

    interface data {
        option: "crypto" | "biz",
        token: string,
        threshold: number,
        fee: number,
        proposers: string[],
        proposalReviewPeriod: number,
        registrationPeriod: number,
        preSnapshotPeriod: number,
        votingPeriod: number,
        postSnapshotPeriod: number,
        executionDelayPeriod: number,
        turnout: number,
        quorum: number,
    }
    
    const daoData: data = {
        option: option,
        token: currencyID,
        threshold: 1,
        fee: 1,
        proposers: whitelist,
        proposalReviewPeriod: period,
        registrationPeriod: period,
        preSnapshotPeriod: period,
        votingPeriod: period,
        postSnapshotPeriod: period,
        executionDelayPeriod: period,
        turnout: 1,
        quorum: 1,
    };
    
    const createOperation = mitum.dao.createService(contractAddress, sender, daoData, currencyID);
    writeLog("createService Operation\n" + JSON.stringify(createOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, createOperation, wait);
}

// updateService
const updateService = async (contractAddress: string, sender: string, option: "crypto" | "biz", whiteAccount: string, period: number, currencyID: string, privatekey: string) => {
    const whitelist = [whiteAccount];

    interface data {
        option: "crypto" | "biz",
        token: string,
        threshold: number,
        fee: number,
        proposers: string[],
        proposalReviewPeriod: number,
        registrationPeriod: number,
        preSnapshotPeriod: number,
        votingPeriod: number,
        postSnapshotPeriod: number,
        executionDelayPeriod: number,
        turnout: number,
        quorum: number,
    }
    
    const daoData: data = {
        option: option,
        token: currencyID,
        threshold: 1,
        fee: 1,
        proposers: whitelist,
        proposalReviewPeriod: period,
        registrationPeriod: period,
        preSnapshotPeriod: period,
        votingPeriod: period,
        postSnapshotPeriod: period,
        executionDelayPeriod: period,
        turnout: 1,
        quorum: 1,
    };
    
    
    const updateOperation = mitum.dao.updateService(contractAddress, sender, daoData, currencyID);
    writeLog("updateOperation\n" + JSON.stringify(updateOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, updateOperation, wait);
}

// writeBizProposal
const writeBizProposal = async (proposer: string, options: number) => {
    const startTime = new Date().getTime();
    const url = "www.socialinfratech.com";
    const hash = "381yXYxtWCavzPxeUXRewT412gbLt2hx7VanKazkBrsnyfPPBdXfoG52Yb2wkF8vC3KJyoWgETpsN6k97mQ8tUXr1CmTedcj";
    console.log(`startTime : ${startTime}`)
    
    const bizProposal = mitum.dao.writeBizProposal(proposer, Math.floor(startTime/1000), url, hash, options)
    return bizProposal
}

// writeCryptoProposal with Transfer Calldata
const writeCryptoProposal = async (sender: string, receiver: string, currencyID: string, proposer: string) => {
    // make callData first
    const amount = 3;
    const transferCallData = mitum.dao.formTransferCalldata(sender, receiver, currencyID, amount);

    // make proposal for "crypto option" using the callData
    const startTime = new Date().getTime();
    const cryptoProposal = mitum.dao.writeCryptoProposal(proposer, Math.floor(startTime/1000), transferCallData);
    return cryptoProposal
}

// writeCryptoProposal with Transfer SetPolicy Calldata
const writeCryptoProposal2 = async (whiteAccount: string, period: number, currencyID: string, proposer: string) => {
    const whitelist = [whiteAccount];

    // make callData first
    interface data {
        token: string,
        threshold: number,
        fee: number,
        proposers: string[],
        proposalReviewPeriod: number,
        registrationPeriod: number,
        preSnapshotPeriod: number,
        votingPeriod: number,
        postSnapshotPeriod: number,
        executionDelayPeriod: number,
        turnout: number,
        quorum: number,
    }
    
    const policyData : data = {
        token: currencyID,
        threshold: 1,
        fee: 1,
        proposers: whitelist,
        proposalReviewPeriod: period,
        registrationPeriod: period,
        preSnapshotPeriod: period,
        votingPeriod: period,
        postSnapshotPeriod: period,
        executionDelayPeriod: period,
        turnout: 1,
        quorum: 1,
    };
    
    const policyCallData = mitum.dao.formSetPolicyCalldata(policyData, currencyID);
    // make proposal for "crypto option" using the callData
    const startTime = new Date().getTime();
    const cryptoProposal = mitum.dao.writeCryptoProposal(proposer, Math.floor(startTime/1000), policyCallData);
    return cryptoProposal
}

// propose the given proposal
const propose = async (contractAddress: string, sender: string, proposal: BizProposal | CryptoProposal, currencyID: string, privatekey: string) => {
    const proposalID = "test_proposal"
    const proposeOperation = mitum.dao.propose(contractAddress, sender, proposalID, proposal, currencyID);
    writeLog("proposeOperation\n" + JSON.stringify(proposeOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, proposeOperation, wait)
}

// register
const register = async (contractAddress: string, sender: string, delegator: string, currencyID: string, privatekey: string) => {
    const proposalID = "test_proposal";
    const registOperation = mitum.dao.register(contractAddress, sender, proposalID, currencyID, delegator);
    writeLog("registerOperation\n" + JSON.stringify(registOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, registOperation, wait)
}

// snapBefore
const snapBefore = async (contractAddress: string, sender: string, currencyID: string, privatekey: string) => {
    const proposalID = "test_proposal";
    const snapOperation = mitum.dao.snapBeforeVoting(contractAddress, sender, proposalID, currencyID);
    writeLog("snapBefore Operation\n" + JSON.stringify(snapOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, snapOperation, wait)
}

// castVote
const castVote = async (contractAddress: string, sender: string, voteOption: number, currencyID: string, privatekey: string) => {
    const proposalID = "test_proposal";
    const castVoteOperation = mitum.dao.castVote(contractAddress, sender, proposalID, voteOption, currencyID);
    writeLog("castVoteOperation\n" + JSON.stringify(castVoteOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, castVoteOperation, wait)
}

// snapPost
const snapPost = async (contractAddress: string, sender: string, currencyID: string, privatekey: string) => {
    const proposalID = "test_proposal";
    const snapOperation = mitum.dao.snapAfterVoting(contractAddress, sender, proposalID, currencyID);
    writeLog("snapPost Operation\n" + JSON.stringify(snapOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, snapOperation, wait)
}

// execute
const execute = async (contractAddress: string, sender: string, currencyID: string, privatekey: string) => {
    const proposalID = "test_proposal";
    const executeOperation = mitum.dao.execute(contractAddress, sender, proposalID, currencyID);
    writeLog("execute Operation\n" + JSON.stringify(executeOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, executeOperation, wait)
}

// Function for DAO GET method

// get delegatorInfo
const getServiceInfo = async (contractAddress: string) => {
    await mitum.dao.getServiceInfo(contractAddress).then((res) => {
        console.log(res);
        writeLog(`daoServiceInfo\n` + JSON.stringify(res));
    })
}

const getProposalInfo = async (contractAddress: string) => {
    const proposalID = "test_proposal";
    await mitum.dao.getProposalInfo(contractAddress, proposalID).then((res) => {
        console.log(res);
        writeLog(`proposalInfo\n` + JSON.stringify(res));
    })
}

const getDelegatorInfo = async (contractAddress: string, delegator: string) => {
    const proposalID = "test_proposal";
    await mitum.dao.getDelegatorInfo(contractAddress, proposalID, delegator).then((res) => {
        console.log(res);
        writeLog(`delegatorInfo\n` + JSON.stringify(res));
    })
}

const getVoterInfo = async (contractAddress: string) => {
    const proposalID = "test_proposal";
    await mitum.dao.getVoterInfo(contractAddress, proposalID).then((res) => {
        console.log(res);
        writeLog(`getVoterInfo\n` + JSON.stringify(res));
    })
}

const getVotingResult = async (contractAddress: string) => {
    const proposalID = "test_proposal";
    await mitum.dao.getVotingResult(contractAddress, proposalID).then((res) => {
        console.log(res);
        writeLog(`getVotingResult\n` + JSON.stringify(res));
    })
}

const getBalance = async (address: string) => {
    await mitum.account.balance(address).then((res) => {
        console.log(res);
        writeLog(`Balance Info\n` + JSON.stringify(res));
    })
}

// execute
async function main() {
    if (test_address && test_privatekey && test_currencyID) {
        const NA1 = await makeNormalAccount(mitum, test_address, test_currencyID, 1000, test_privatekey, wait, writeLog);
        const NA2 = await makeNormalAccount(mitum, test_address, test_currencyID, 50, test_privatekey, wait, writeLog);
        const CA1 = await  makeContractAccount(mitum, test_address, test_currencyID, 50, test_privatekey, wait, writeLog);

        const contractAddress = CA1.address;

        //await getBalance(test_address);
        await wait();
        //createCollection test
        await createService(contractAddress, test_address, "biz", test_address, 30, test_currencyID, test_privatekey);
        await getServiceInfo(contractAddress);

        //propose proposal
        const bizProposal = await writeBizProposal(test_address, 2);
        await propose(contractAddress, test_address, bizProposal, test_currencyID, test_privatekey);

        // const cryptoProposal = await writeCryptoProposal(test_address, NA2.address, test_currencyID, test_address);
        // await propose(contractAddress, test_address, cryptoProposal, test_currencyID, test_privatekey);

        await getProposalInfo(contractAddress);
        await getBalance(CA1.address);

        await waitWithLog(28000);
        
        //register
        await register(contractAddress, NA1.address, NA1.address, test_currencyID, NA1.privatekey);
        await register(contractAddress, test_address,  NA1.address, test_currencyID, test_privatekey);
        await getDelegatorInfo(contractAddress, test_address);
        await getVoterInfo(contractAddress);
        await waitWithLog(10000);

        // //check balance of account to compare votingPower
        // await getBalance(test_address);
        // await getBalance(NA1.address);
        // await getBalance(CA1.address);

        //snap before
        await snapBefore(contractAddress, test_address,test_currencyID, test_privatekey);
        await waitWithLog(20000);

        //cast vote
        //await castVote(contractAddress, test_address, 1, test_currencyID, test_privatekey);
        await castVote(contractAddress, NA1.address, 0, test_currencyID, NA1.privatekey);
        await waitWithLog(20000);
        await getVotingResult(contractAddress);

        //snap post
        await snapPost(contractAddress, test_address,test_currencyID, test_privatekey);
        await getVotingResult(contractAddress);
        await waitWithLog(28000);

        //execute
        await execute(contractAddress, test_address, test_currencyID, test_privatekey);
        await getProposalInfo(contractAddress);
        await getVotingResult(contractAddress);
    }
}

main();