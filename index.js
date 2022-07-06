const express = require('express');
const app = express();
var cors = require('cors')
var bodyParser = require('body-parser')
const mongoose = require('mongoose')
var path = require('path');
const meterData = require('./routes/meterData')
const reportData = require('./routes/report')
var path = require('path');
require('dotenv').config();
const url = "mongodb://127.0.0.1:27017"
mongoose.connect(url, {useNewUrlParser:true,useUnifiedTopology: true})
const con = mongoose.connection

con.on('open', function() {
    console.log('connected to DB');
})

con.on('error', function() {
    console.log('unable to connect DB');
})

app.get('/', function (req, res) {
    res.send("Mind-graph! working...")
})

app.use(cors())
app.use(express.static(path.join(__dirname,'uploads')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/api', meterData)
app.use('/api', reportData)
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`server started ${PORT}`))