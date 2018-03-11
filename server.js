const fs = require('fs')
const express = require('express')

const args = process.argv.concat(new Array(4).fill(null)).slice(2)

const PORT = 8080;
const MAX_NUM_PRIMES = args[0] || 512
const app = express();

const primes = fs.readFileSync(process.cwd()+'/primesupto1000K.ls')
    .toString()
    .split(/\s/)
    .map(p => parseInt(p))
    .filter(p => p)

app.get('/',(req,res)=>{
    res.sendFile(process.cwd()+'/primer.html')
})

app.get('/main.js',(req,res)=>{
    res.sendFile(process.cwd()+'/main.js')
})

app.get('/primes.json', (req,res)=>{
    res.send(JSON.stringify(primes.slice(0,MAX_NUM_PRIMES)))
})


app.listen(PORT, ()=> console.log(`We listenin http://127.0.0.1:${PORT}`))