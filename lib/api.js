'use strict';

const request = require('request');
const crypto = require('crypto');
const mongo = require('../db');

const createHeaders = async (verb, path, postBody) => {
    const result = await mongo.get('Users', { name: 'testnet' });
    const { apiKey, apiSecret } = result.pop();    
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

const setLeverage = async (data) => {
    const verb = 'POST';
    const path = '/api/v1/position/leverage';
    //const data = { symbol: "XBTUSD", leverage: 20 };
    const postBody = JSON.stringify(data);
    const headers = await createHeaders(verb, path, postBody);

    const requestOptions = {
        headers: headers,
        url: apiUrl + path,
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

const setOrder = async (data) => {
    const verb = 'POST';
    const path = '/api/v1/order';
    //const data = { symbol: "XBTUSD", orderQty: 1000, price: 8000, ordType: "StopLimit", side: "Sell", stopPx: "7900" };
    const postBody = JSON.stringify(data);
    const headers = await createHeaders(verb, path, postBody);

    const requestOptions = {
        headers: headers,
        url: apiUrl + path,
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

const getOrder = async (data) => {
    const verb = 'GET';
    const path = '/api/v1/order';    
    const postBody = JSON.stringify(data);
    const headers = await createHeaders(verb, path, postBody);

    const requestOptions = {
        headers: headers,
        url: apiUrl + path,
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

const cancelOrder = async (data) => {
    const verb = 'DELETE';
    const path = '/api/v1/order/all';    
    const postBody = JSON.stringify(data);
    const headers = await createHeaders(verb, path, postBody);

    const requestOptions = {
        headers: headers,
        url: apiUrl + path,
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

const getPosition = async () => {
    const verb = 'GET';
    const path = '/api/v1/position';
    const data = { "symbol": "XBTUSD" }
    const postBody = JSON.stringify(data);
    const headers = await createHeaders(verb, path, postBody);

    const requestOptions = {
        headers: headers,
        url: apiUrl + path,
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

const walletSummary = async () => {
    const verb = 'GET';
    const path = '/api/v1/user/walletSummary';
    //const data = {"symbol": "XBTUSD"}
    const postBody = JSON.stringify({ "currency": "XBt" });
    const headers = await createHeaders(verb, path, postBody);

    const requestOptions = {
        headers: headers,
        url: apiUrl + path,
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

const getInstrument = async () => {
    const verb = "GET";
    const path = "/api/v1/instrument";
    //const data = {"symbol": "XBTUSD"}
    const postBody = JSON.stringify({ "symbol": "XBTUSD", "count": "5" });
    const headers = await createHeaders(verb, path, postBody);

    const requestOptions = {
        headers: headers,
        url: apiUrl + path,
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
    getOrder,
    setOrder,
    cancelOrder,
    setLeverage,
    getPosition,
    walletSummary,
    getInstrument
};


