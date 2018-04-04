'use strict';

const express = require('express');
const cfg = require('../config');
const app = express();
const BitMEX = require('./core/client');
const bodyParser = require('body-parser');
const uuid = require('uuid/v4');

let clients = {};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.end('application working');
});

app.post('/client', (req, res) => {
    let data = req.body;
    let cli = BitMEX(data);
    let _uuid = uuid();
    console.log(cli);
    clients[_uuid] = cli;
    res.end('Client created with uuid: ' + _uuid);
});

app.get('/client', (req, res) => {
    res.json(clients);
});

app.post('/long', (req, res) => {
    let uuid = req.body.uuid;
    console.log(uuid);
    console.log(clients[uuid]);
    clients[uuid].openLong();
    res.end('enter long position');
});

app.post('/short', (req, res) => {
    let uuid = req.body.uuid;
    clients[uuid].openShort();
    res.end('enter short position');
});


app.listen(process.env.PORT || 8000, () => console.log('bitmex api bot running on port: ' + (process.env.PORT || 8000)));