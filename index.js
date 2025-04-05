import sha256 from "sha256";
import * as fs from 'node:fs';
import { constants } from "node:buffer";
import express from 'express'
import cors from 'cors'

var app = express();
app.use(cors())
app.use(express.json())
app.use(express.static('public'));

const jsonDataFile = "./chainData.json"
const HTTP_PORT = 8000

const objHippoChain = {

    //If chain is empty (chainData.json does not exist) , then initialize chain with this
    chain: [
        {
            index:0,
            time:Date.now(),
            transaction:{},
            nonce:0, //Proof of work
            hash:"000hash", //The more 0's the more difficult to find an open hash
            previousHash:"000prevhash"
        },
    ],

    //Check if the chain exists. If it does, then import data from chainData.json and set chain = to that
    checkChainExists: (callback) => {
        fs.access(jsonDataFile, constants.F_OK, (err) => {
            if(err) {
                console.log("File does not exist. Initializing the chain as new chain.")
                callback();
            }
            else {
                fs.readFile(jsonDataFile, (err, data) => {
                    if(err) {
                        console.log("Error reading file", err.message)
                        callback();
                    }
                    else {
                        try {
                            const jsonDataFileContent = JSON.parse(data)
                            objHippoChain.chain = jsonDataFileContent
                            console.log("Chain loaded successfully")
                        }
                        catch (err) {
                            console.log("Something went wrong when parsing the external chain data in the json file:", err.message)
                        } finally {
                            callback();
                        }
                    }
                })
            }
        })
    },

    getLastBlock: () => {
        return objHippoChain.chain[objHippoChain.chain.length -1]
    },
    generateHash: (strPreviousHash, datStartTime, objNewTransaction) => {
        let strLocalHash = '';
        let intNonce = 0;

        while(strLocalHash.substring(0,3) != '000') {
            intNonce++
            strLocalHash = sha256(`${strPreviousHash}${datStartTime}${objNewTransaction}${intNonce}`)
        }
        return {strLocalHash, intNonce}
    },
    createNewBlock: (decTransAmt, strTransSender, strTransRecipient) => {
        const objNewTransaction = {decTransAmt, strTransSender, strTransRecipient}
        const datInitTime = Date.now()
        const prevBlock = objHippoChain.getLastBlock()
        const newCoinHash = objHippoChain.generateHash(prevBlock.hash,datInitTime,objNewTransaction)
        const newBlock = {
            index: prevBlock.index + 1,
            time: datInitTime,
            transaction: objNewTransaction,
            nonce: newCoinHash.intNonce,
            hash: newCoinHash.strLocalHash,
            previousHash: prevBlock.hash
        }

        //Method for checking if hash already exists on chain. Basically just filter the existing chain and if the length is 0 then it 
        //doesn't exist on the chain
        const filteredChain = objHippoChain.chain.filter(block => block.hash == newCoinHash.strLocalHash)
        if(filteredChain.length == 0 ) {
            console.log("Hash does not exist on chain. Generating new block...")
            objHippoChain.chain.push(newBlock)
        } else {
            console.log("Hash already exists on chain. Discarding block...")
        }


    },
    printChain: () => {
        console.log(objHippoChain.chain)
    }   

}

app.listen(HTTP_PORT, () => {
    console.log('App listening on port', HTTP_PORT)
})

//Post for the frontend to generate a new block
app.post('/generateBlock', (req, res) => {

    const decTransAmt = req.body.amount
    const strTransSender = req.body.sender
    const strTransRecipient = req.body.recipient

    objHippoChain.checkChainExists(() => {
      
      objHippoChain.createNewBlock(decTransAmt, strTransSender, strTransRecipient);
      console.log("Block Generated Successfully!")
      const content = JSON.stringify(objHippoChain.chain);
  
      fs.writeFile('./chainData.json', content, err => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Failed to write file" });
        }
  
        res.status(200).json({ message: "Data saved successfully!", block: objHippoChain.getLastBlock()});
        //objHippoChain.printChain();
      });
    });
  });

  //get for frontend to view the chain data
  app.get('/viewChain',(req, res) => {
    objHippoChain.checkChainExists(() => {
        res.status(200).json({chain: objHippoChain.chain});
        console.log("Chain data sent to front end!")
    })
})