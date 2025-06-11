const express = require('express')
const cors = require('cors')
const fs = require('fs')
const app = express()
const port = 3000

let corsOptions = {
   origin : ['http://localhost:5173'],
}
app.use(cors(corsOptions))

app.get('/', (req, res) => {
    const data = fs.readFileSync('output.json', charset='utf8');
    if (req.query.start && req.query.end) {
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    } else {
        res.sendStatus(404);
    }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
