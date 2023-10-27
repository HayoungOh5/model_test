import { Mitum } from "../../mitumjs/src/index";
import { Operation as OP, Fact } from "../../mitumjs/src/operation/base"

// make normal account
export const makeNormalAccount = async (mitum: Mitum, sender: string, currencyID: string, amount: number, privatekey: string, wait: () => Promise<unknown>, writeLog: (text: string) => void) => {
    const wallet = mitum.account.createWallet(sender, currencyID, amount);
    await mitum.account.touch(privatekey, wallet).then((res) => { console.log(res); })
    writeLog("Normal account\n" + JSON.stringify(wallet.wallet));
    await wait();
    return wallet.wallet;
};

// make contract account
export const makeContractAccount = async (mitum: Mitum, sender: string, currencyID: string, amount: number, privatekey: string, wait: () => Promise<unknown>, writeLog: (text: string) => void) => {
    const wallet = mitum.contract.createWallet(sender, currencyID, amount);
    await mitum.contract.touch(privatekey, wallet).then((res) => { console.log(res); })
    writeLog("Contract account\n" + JSON.stringify(wallet.wallet));
    await wait();
    return wallet.wallet;
};

// sign and send operation
export const signAndSend = async (mitum: Mitum, privatekey: string, operation: OP<Fact>, wait: () => Promise<unknown>) => {
    const signedOp = mitum.operation.sign(privatekey, operation);
    await mitum.operation.send(signedOp.toHintedObject()).then((res) => { console.log(res.data); })
    await wait();
}