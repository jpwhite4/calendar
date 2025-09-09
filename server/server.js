const calFetch = require('./calendar');
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const app = express()
const port = 3000
const nodeCache = require('node-cache');

let corsOptions = {
   origin : ['http://localhost:5173'],
}
app.use(cors(corsOptions))

const myCache = new nodeCache( { stdTTL: 60, checkperiod: 600 } );

app.get('/', (req, res) => {

    if (req.query.start && req.query.end) {

        const start = new Date(req.query.start);
        const end = new Date(req.query.end);

        if (isNaN(start) || isNaN(end) ) {
            res.sendStatus(404);
            return;
        }

        const ckey = req.query.start + '-' + req.query.end;
        let resData = myCache.get(ckey);

        if (resData === undefined) {
            console.log('Cache miss');
            calFetch.fetchCalendar(start, end).then(calresult => {
                const calstr = JSON.stringify(calresult);
                myCache.set(ckey, calstr);
                console.log("Sending update and add to cache", new Date());
                res.setHeader('Content-Type', 'application/json');
                res.send(calstr);
            }).catch(function(err) {
                console.log(err);
                res.sendStatus(503);
            });
        } else {
            console.log("Sending update From Cache", new Date());
            res.setHeader('Content-Type', 'application/json');
            res.send(resData);
        }
    } else {
        res.sendStatus(404);
    }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
