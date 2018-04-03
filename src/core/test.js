"use strict";

let apiKey = require('../config').apiKey;
let apiSecret = require('../config').apiSecret;

let BitMEXClient = require('./client')({apiKey, apiSecret});
//let api = require('./bitmex-api')({apiKey, apiSecret});
//api.getPosition().then(res => console.log(res)).catch(err => console.log(err));

BitMEXClient.enterLongPos();
//api.setOrder({ symbol: "XBTUSD", orderQty: 1000, price: 8000,  side: "Sell" });

setTimeout(() => {}, 25000);