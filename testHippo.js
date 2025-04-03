import { objHippoChain } from "./index.js";
import {fs} from "./index.js"
import express from 'express'
import cors from 'cors'
var app = express();
app.use(cors())
app.use(express.json())
const HTTP_PORT = 8000

objHippoChain.checkChainExists(() => {
    objHippoChain.printChain()
    objHippoChain.createNewBlock(40, 'Ben', 'Chandler')
    objHippoChain.createNewBlock(50, 'Seth', 'Franklin')
    objHippoChain.createNewBlock(100, 'BenB', 'BenB')
    objHippoChain.printChain()

    const content = JSON.stringify(objHippoChain.chain)

    fs.writeFile('./chainData.json', content, err => {
        if (err) {
        console.error(err);
        } else {
        console.log("Data Saved Successfully!")
        }
    });
});
