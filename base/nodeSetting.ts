import 'dotenv/config'

export const setNode = (args: string[]) => {    
    let node_type: string = "default";

    if (args.length) {
        node_type = args[0];
    }

    let node_url: string | undefined;
    let test_address: string | undefined;
    let test_privatekey: string | undefined;
    let test_currencyID: string | undefined;

    if (node_type === "hackerton") {
        node_url = process.env.HACKERTON_TEST_NODE_URL;
        test_address = process.env.HACKERTON_TEST_ACCOUNT_ADDRESS;
        test_privatekey = process.env.HACKERTON_TEST_ACCOUNT_PRIVATEKEY;
        test_currencyID = "PEN";
    } else if (node_type === "mitum") {
        node_url = process.env.MITUM_TEST_NODE_URL;
        test_address = process.env.MITUM_TEST_ACCOUNT_ADDRESS; 
        test_privatekey = process.env.MITUM_TEST_ACCOUNT_PRIVATEKEY;
        test_currencyID = "PEN";
    } else if (node_type === "minic") {
        node_url = process.env.MINIC_TEST_NODE_URL;
        test_address = process.env.MINIC_TEST_ACCOUNT_ADDRESS; 
        test_privatekey = process.env.MINIC_TEST_ACCOUNT_PRIVATEKEY;
        test_currencyID = "PEN";
    } else {
        node_url = process.env.LOCAL_TEST_NODE_URL;
        test_address = process.env.LOCAL_TEST_ACCOUNT_ADDRESS;
        test_privatekey = process.env.LOCAL_TEST_ACCOUNT_PRIVATEKEY;
        test_currencyID = "MCC";
    }
    return { node_type, node_url, test_address, test_privatekey, test_currencyID }
}