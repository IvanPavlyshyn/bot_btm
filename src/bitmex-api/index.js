'use strict';

const request = require('request');
const crypto = require('crypto');

const BitMEXApi = (profile) => {    

    const { apiKey, apiSecret, apiUrl } = profile;
    apiUrl ? apiUrl = 'https://bitmex.com' : apiUrl = 'https://testnet.bitmex.com';

    const createHeaders = async (verb, path, postBody) => {
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

    const walletSummary = async (data) => {
        const verb = 'GET';
        const path = '/api/v1/user/walletSummary';       
        const postBody = JSON.stringify(data || { "currency": "XBt" });
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

    const getInstrument = async (data) => {
        const verb = "GET";
        const path = "/api/v1/instrument";     
        const postBody = JSON.stringify(data || { "symbol": "XBTUSD", "count": "5" });
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

    return {
        getOrder,
        setOrder,
        cancelOrder,
        setLeverage,
        getPosition,
        walletSummary,
        getInstrument
    };

}



module.exports = BitMEXApi;


