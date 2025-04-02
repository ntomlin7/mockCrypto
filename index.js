import sha256 from "sha256";

// const express = require('express')
// const cors = require('cors')
// Import file system, which will allow us to write the contents of the chain to an external json file
import * as fs from 'node:fs';
import { constants } from "node:buffer";
import { json } from "node:stream/consumers";
// var app = express();
// app.use(cors())
// app.use(express.json())

const jsonDataFile = "./chainData.json"

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
                            console.log("Something went wrong when parsing the external chain data in the json file", err.message)
                        } finally {
                            callback();
                        }
                    }
                })
            }
        })
    },

    //If chain is not empty, then import data from chainData.json and set chain = to that
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
        objHippoChain.chain.push(newBlock)

        //Store blocks onto an chain and then store than in external JSON file?

    },
    printChain: () => {
        console.log(objHippoChain.chain)
    }   

}

export {objHippoChain};
export {fs};