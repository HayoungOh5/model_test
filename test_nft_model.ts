import 'dotenv/config'
import { Mitum } from "../mitumjs/src/index";
import { setNode } from './base/nodeSetting';
import { makeNormalAccount, makeContractAccount, signAndSend } from './base/common';
import * as fs from 'fs';

const args = process.argv.slice(2);
const { node_type, node_url, test_address, test_privatekey, test_currencyID } = setNode(args);

// Log file creation, write
const logFile = `Log/test_nft_with_${node_type}_node_log.txt`
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


// Function for NFT method
// createCollection
const createCollection = async (contractAddress: string, sender: string, whiteAccount: string, currencyID: string, privatekey: string) => {
    const name = "Socialinfratech";
    const uri = "www.socialinfratech.com";
    const royalty = 30;
    const whitelist = [whiteAccount];

    interface data {
        name: string,
        uri: string,
        royalty: number,
        whitelist: string[],
    }
    
    const collectionData: data = {
        name: name,
        uri: uri,
        royalty: royalty,
        whitelist: whitelist,
    };
    
    const createOperation = mitum.nft.createCollection(contractAddress, sender, collectionData, currencyID);
    writeLog("registOperation\n" + JSON.stringify(createOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, createOperation, wait);
}

// setPolicy
const setPolicy = async (contractAddress: string, sender: string, whiteAccount: string, currencyID: string, privatekey: string) => {
    const name = "Socialinfratech2";
    const uri = "www.socialinfratech2.com";
    const royalty = 10;
    const whitelist = [whiteAccount];

    interface data {
        name: string,
        uri: string,
        royalty: number,
        whitelist: string[],
    }
    
    const collectionData: data = {
        name: name,
        uri: uri,
        royalty: royalty,
        whitelist: whitelist,
    };
    
    const setPolicyOperation = mitum.nft.setPolicy(contractAddress, sender, collectionData, currencyID);
    writeLog("setPolicyOperation\n" + JSON.stringify(setPolicyOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, setPolicyOperation, wait);
}

// mint NFT
const mintNFT = async (contractAddress: string, sender: string, reciever: string, creator: string, currencyID: string, privatekey: string) => {
    const uri = "www.protocon.com";
    const hash = "381yXYxtWCavzPxeUXRewT412gbLt2hx7VanKazkBrsnyfPPBdXfoG52Yb2wkF8vC3KJyoWgETpsN6k97mQ8tUXr1CmTedcj";

    const mintOperation = mitum.nft.mint(contractAddress, sender, reciever, uri, hash, currencyID, creator);
    writeLog("mintOperation\n" + JSON.stringify(mintOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, mintOperation, wait)
}

// mint NFT with mutiple creators
const mintForMultiCreators = async (contractAddress: string, sender: string, reciever: string, creator1: string, creator2: string, currencyID: string, privatekey: string) => {
    const uri = "www.protocon2.com";
    const hash = "381yXYxtWCavzPxeUXRewT412gbLt2hx7VanKazkBrsnyfPPBdXfoG52Yb2wkF8vC3KJyoWgETpsN6k97mQ8tUXr1CmTedcj";

    const creatorInfo1 = {
        account: creator1,
        share: 33,
    };
    const creatorInfo2 = {
        account: creator2,
        share: 66,
    };

    const mintOperation = mitum.nft.mintForMultiCreators(contractAddress, sender, reciever, uri, hash, currencyID, [creatorInfo1, creatorInfo2]);
    writeLog("mintForMultiCreatorsOperation\n" + JSON.stringify(mintOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, mintOperation, wait)
}

// approve NFT
const approveNFT = async (contractAddress: string, sender: string, operator: string, nftId: number, currencyID: string, privatekey: string) => {
    const approveOperation = mitum.nft.approve(contractAddress, sender, operator, nftId, currencyID);
    writeLog("approveOperation\n" + JSON.stringify(approveOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, approveOperation, wait)
}

// setApprovalForAll
const setApprovalForAllNFT = async (contractAddress: string, sender: string, operator: string, mode: "allow" | "cancel", currencyID: string, privatekey: string) => {
    const approveOperation = mitum.nft.setApprovalForAll(contractAddress, sender, operator, mode, currencyID);
    writeLog("setApprovalForAllOperation\n" + JSON.stringify(approveOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, approveOperation, wait)
}

// transfer NFT
const transferNFT= async (contractAddress: string, sender: string, reciever: string, nftId: number, currencyID: string, privatekey: string) => {
    const transferOperation = mitum.nft.transfer(contractAddress, sender, reciever, nftId, currencyID);
    writeLog("transferOperation\n" + JSON.stringify(transferOperation.toHintedObject()));
    await signAndSend(mitum, privatekey, transferOperation, wait)
}

// Function for NFT GET method

// get collection info (check createCollection)
const getCollectionInfo = async (contractAddress: string) => {
    await mitum.nft.getCollectionInfo(contractAddress).then((res) => {
        console.log(res);
        writeLog("Collection Informtaion\n" + JSON.stringify(res));
    })
}

const getNFTs = async (contractAddress: string) => {
    await mitum.nft.getNFTs(contractAddress).then((res) => {
        console.log(res);
        writeLog(`NFTs of created collection\n` + JSON.stringify(res));
    })
}

const getTotalSupply = async (contractAddress: string) => {
    await mitum.nft.totalSupply(contractAddress).then((res) => {
        console.log(res);
        writeLog(`total Supply of NFTs\n` + JSON.stringify(res));
    })
}

const getNFTInfo = async (contractAddress: string, nftId: number) => {
    await mitum.nft.getNFTInfo(contractAddress, nftId).then((res) => {
        console.log(res);
        writeLog(`NFT info with nftid number ${nftId}\n` + JSON.stringify(res));
    })
}

const getOwner = async (contractAddress: string, nftId: number) => {
    await mitum.nft.ownerOf(contractAddress, nftId).then((res) => {
        console.log(res);
        writeLog(`NFT Owner with nftid number ${nftId}\n` + JSON.stringify(res));
    })
}

const getTokenURI = async (contractAddress: string, nftId: number) => {
    await mitum.nft.tokenURI(contractAddress, nftId).then((res) => {
        console.log(res);
        writeLog(`Token URI with nftid number ${nftId}\n` + JSON.stringify(res));
    })
}

const getApproved = async (contractAddress: string, nftId: number) => {
    await mitum.nft.getApproved(contractAddress, nftId).then((res) => {
        console.log(res);
        writeLog(`Approved NFT number ${nftId}\n` + JSON.stringify(res));
    })
}

const isApprovedForAll = async (contractAddress: string, owner: string) => {
    await mitum.nft.isApprovedForAll(contractAddress, owner).then((res) => {
        console.log(res);
        writeLog(`IsApprovedForAll ${owner}\n` + JSON.stringify(res));
    })
}

// execute
async function main() {
    if (test_address && test_privatekey && test_currencyID) {
        const NA1 = await makeNormalAccount(mitum, test_address, test_currencyID, 50, test_privatekey, wait, writeLog);
        const NA2 = await makeNormalAccount(mitum, test_address, test_currencyID, 50, test_privatekey, wait, writeLog);
        const CA1 = await  makeContractAccount(mitum, test_address, test_currencyID, 50, test_privatekey, wait, writeLog);

        const contractAddress = CA1.address;

        //createCollection test
        await createCollection(contractAddress, test_address, NA2.address, test_currencyID, test_privatekey);
        await getCollectionInfo(contractAddress);

        //setPollicy test
        await setPolicy(contractAddress, test_address, NA1.address, test_currencyID, test_privatekey);
        await getCollectionInfo(contractAddress);

        //mint test
        await mintNFT(contractAddress, test_address, test_address, test_address, test_currencyID, test_privatekey);
        await getNFTInfo(contractAddress, 0);
        await getTokenURI(contractAddress, 0);

        //mint by whitelist test 
        await mintNFT(contractAddress, NA1.address, test_address, test_address, test_currencyID, NA1.privatekey);
        await getNFTInfo(contractAddress, 1);
        await getOwner(contractAddress, 1);

        //mintForMultiCreator test
        await mintForMultiCreators(contractAddress, test_address, test_address, test_address, NA1.address, test_currencyID, test_privatekey);
        await getNFTInfo(contractAddress, 2);
        await getTotalSupply(contractAddress);

        //setApprovalForAll allow test
        await setApprovalForAllNFT(contractAddress, test_address, NA2.address, "allow", test_currencyID, test_privatekey);
        await isApprovedForAll(contractAddress, test_address);

        //setApprovalForAll cancel test
        await setApprovalForAllNFT(contractAddress, test_address, NA2.address, "cancel", test_currencyID, test_privatekey);
        await getNFTs(contractAddress);

        //approve test
        await approveNFT(contractAddress, test_address, NA1.address, 0, test_currencyID, test_privatekey);
        await getApproved(contractAddress, 0);

        //transfer test
        await transferNFT(contractAddress, NA1.address, NA2.address, 0, test_currencyID, NA1.privatekey);
        await getOwner(contractAddress, 0);
    }
}

main();