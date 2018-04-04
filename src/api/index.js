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
    console.log(headers);
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
            else resolve(JSON.parse(body));
        });
    });    
}

const setOrder = (data) => {
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
            else resolve(JSON.parse(body));
        });
    });
};

const getOrder = (data) => {
    const verb = 'GET';
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
            else resolve(JSON.parse(body));
        });
    });
}

const getPosition = () => {
    const verb = 'GET';
    const path = '/api/v1/position';
    const data = {"symbol": "XBTUSD"}
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
            else resolve(JSON.parse(body));
        });
    });
};

const walletSummary = () => {
    const verb = 'GET';
    const path = '/api/v1/user/walletSummary';
    //const data = {"symbol": "XBTUSD"}
    const postBody = JSON.stringify({ "currency" : "XBt"});
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
            else resolve(JSON.parse(body));
        });
    });
}

const getInstrument = () => {
    const verb = "GET";
    const path = "/api/v1/instrument";
    //const data = {"symbol": "XBTUSD"}
    const postBody = JSON.stringify({ "symbol" : "XBTUSD", "count": "5"});
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
            else resolve(JSON.parse(body));
        });
    });
}


module.exports = {
    setOrder,
    setLeverage,
    getPosition,
    walletSummary,
    getInstrument
};


/*
(async () => {
    let result = await getPosition();
    console.log(result);
    //console.log(result[0].lastPrice);
})(); 

setTimeout(() => {}, 10000); */