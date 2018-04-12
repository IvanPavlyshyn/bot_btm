'use strict';

const express = require('express');
const server = express();

const bodyParser = require('body-parser');
const uuid = require('uuid/v4');
const router = require('./routes');

let clients = {};

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

router(server);

server.listen(process.env.PORT || 8000, () => console.log('bitmex api bot running on port: ' + (process.env.PORT || 8000)));

process.on('uncaughtException', (err) => {
    console.log(err);
});