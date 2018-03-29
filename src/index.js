'use strict';

const express = require('express');
const cfg = require('./config');
const app = express();
const api = require('./api');
const bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.end('application working');
});

app.post('/bitmex/order', async (req, res) => {
    console.log(req.body);
    let data = req.body;
    let result = await api.openOrder(data);
    res.json(result);
});

app.post('/bitmex/leverage', async (req, res) => {
    console.log(req.body);
    let data = req.body;
    let result = await api.setLeverage(data);
    res.json(result);
});

app.post('/testnet/order', async (req, res) => {
    console.log(req.body);
    let data = req.body;
    let result = await api.openOrder(data);
    res.json(result);
});

app.post('/testnet/leverage', async (req, res) => {
    console.log(req.body);
    let data = req.body;
    let result = await api.setLeverage(data);
    res.json(result);
});


app.listen(process.env.PORT || 8000, () => console.log('bitmex api bot running on port: ' + (process.env.PORT || 8000)));