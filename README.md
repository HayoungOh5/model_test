## Abstraction

- __model_test__ is the test code for mitum model using mitumjs SDK written in the typescript language.
- Test code for __token__, __point__, __timestamp__, __nft__, __credential__, __dao__ and __STO__ models has been implemented.
- Currently, tests are implemented for local test node, Mitum development node, Minic development node, and hackathon node.
- The .env file contains the paths of the nodes, the address of the test account, and the private key.

<br>

## **Install**

The model_test directory must be in the same location as the mitumjs directory.  
(Or you can set the path to mitumjs yourself.)

```bash
$ git clone https://github.com/HayoungOh5/model_test.git
$ cd model_test
$ npm i
```

<br>

## Usage

- Specify which node to use after the run command.

```bash
$ ts-node {Test file to run} "{Node to test}"

```
- For example, if you want to test the nft model on the mitum test node, enter the following.

```bash
$ ts-node test_nft_model.ts "mitum"

```

- You can use the following options (If you do not specify a node name, it will use the "local" node as default.)
    - "local"
    - "mitum"
    - "minic"
    - "hackerton"


When a test runs, a log file is created in the Log directory. (Please note that a new one is created every time you run the same test.)

- The log file contains the results of GET method and hintedObject of operations that have not yet been signed before POST method.

- Since it is basically JSON format, it is recommended to use the txt json formatter extension in Visual Studio. (<cod>press option + shift + "f"</code>)

The name of log file can be modified at the top of the test code, and the delay time (in milliseconds) for confirming the operation can also be set.

- Typically 8 to 10 seconds is safe. (For local nodes, it's a bit slower, so 10 seconds is safe.)
