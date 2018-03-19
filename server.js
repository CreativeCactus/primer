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
app.get('/bases',(req,res)=>{
    res.sendFile(process.cwd()+'/primer.html')
})

app.get('/canvas.js',(req,res)=>{
    res.sendFile(process.cwd()+'/canvas.js')
})

app.get('/main.js',(req,res)=>{
    const page = req.query.uri.split('/').slice(-1)[0]
    console.log(page)
    const script = {
        '':'main.js',
        'bases':'bases.js'
    }[page]
    res.sendFile(process.cwd()+`/${script}`)
})

app.get('/primes.json', (req,res)=>{
    res.send(JSON.stringify(primes.slice(0,MAX_NUM_PRIMES)))
})


app.listen(PORT, ()=> console.log(`We listenin http://127.0.0.1:${PORT}`))