//'use strict';
const request = require('request');
const crypto = require('crypto');
const apiKey = require('../config').apiKey;
const apiSecret = require('../config').apiSecret;

const createHeaders = (verb, path, postBody) => {
    let expires = new Date().getTime() + (60 * 1000);
    let signature = crypto.createHmac('sha256', apiSecret).update(verb + path + expires + postBody).digest('hex');
    let headers = {
        'content-type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'api-expires': expires,
        'api-key': apiKey,
        'api-signature': signature
    };
    return headers;
}

const setLeverage = (data) => {
    const verb = 'POST';
    const path = '/api/v1/position/leverage';
    //const data = { symbol: "XBTUSD", leverage: 20 };
    const postBody = JSON.stringify(data);
    const headers = createHeaders(verb, path, postBody);

    const requestOptions = {
        headers: headers,
        url: 'https://testnet.bitmex.com' + path,
        method: verb,
        body: postBody
    };

    return new Promise((resolve, reject) => {
        request(requestOptions, function (error, response, body) {
            if (error) reject(error);
            else resolve(body);
        });
    });    
}

const openOrder = (data) => {
    const verb = 'POST';
    const path = '/api/v1/order';
    //const data = { symbol: "XBTUSD", orderQty: 1000, price: 8000, ordType: "StopLimit", side: "Sell", stopPx: "7900" };
    const postBody = JSON.stringify(data);
    const headers = createHeaders(verb, path, postBody);

    const requestOptions = {
        headers: headers,
        url: 'https://testnet.bitmex.com' + path,
        method: verb,
        body: postBody
    };

    return new Promise((resolve, reject) => {
        request(requestOptions, function (error, response, body) {
            if (error) reject(error);
            else resolve(body);
        });
    });
};

module.exports = {
    openOrder,
    setLeverage
};


