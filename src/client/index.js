"use strict";

const EventEmitter = require('events').EventEmitter;
const mongo = require('../db');

let validator = {
    "priceDiff": "number",
    "pctPerPos": "number",
    "leverage": "number",
    "stopLossDiff": "number",
    "stopLoss": "number",
    "takeProfit": "number"
}

// TODO: 
/*
* add exit from all positions
* add close all orders
*
**/

const BitMEXClient = (data, profile) => {

    for(let p in validator) 
        if(!(typeof data[p] === validator[p])) throw new Error('Validation Error');

    const { priceDiff, pctPerPos, leverage, stopLossDiff, stopLoss, takeProfit  } = data; 

    const bitmex = require('../bitmex-api')(profile);
    const emitter = new EventEmitter();

    emitter.on('LongFinalStep', async (data) => {
        try {
            let { contractQty, buyPrice } = data;
            let stopPrice = parseInt(buyPrice * (1 - stopLoss)); // for example stopLoss 0.02
            let stopOrd = {
                "symbol": "XBTUSD",
                "side": "Sell",
                "ordType": "StopLimit",
                "orderQty": contractQty,
                "price": stopPrice,
                "stopPx": stopPrice - stopLossDiff
            };
            let stopOrdResult = await bitmex.setOrder(stopOrd);
            let profitPrice = parseInt(buyPrice * (1 + takeProfit )); // should be 0.03
            let profitOrd = {
                "symbol": "XBTUSD",
                "side": "Sell",
                "ordType": "Limit",
                "orderQty": contractQty,
                "price": profitPrice
            };
            let profitOrdResult = await bitmex.setOrder(profitOrd);
        } catch (err) {
            console.log(err);
            await mongo.insert('Errors', { "exchange": "bitmex", "error": err });
        }     
    });

    emitter.on('ShortFinalStep', async (data) => {
        try {
            let { contractQty, sellPrice } = data;
            let stopPrice = parseInt(sellPrice * 1.02);
            let stopOrd = {
                "symbol": "XBTUSD",
                "side": "Buy",
                "ordType": "StopLimit",
                "orderQty": contractQty,
                "price": stopPrice,
                "stopPx": stopPrice + stopLossDiff
            };
            let stopOrdResult = await bitmex.setOrder(stopOrd);
            let profitPrice = parseInt(sellPrice * 0.97);
            let profitOrd = {
                "symbol": "XBTUSD",
                "side": "Buy",
                "ordType": "Limit",
                "orderQty": contractQty,
                "price": profitPrice
            };
            let profitOrdResult = await bitmex.setOrder(profitOrd);
        } catch (err) {
            console.log(err);
            await mongo.insert('Errors', { "exchange": "bitmex", "error": err });
        }      
    });

    const openShort = async () => { //TODO: add custom params for function
             
        try {
            let posResults = await bitmex.getPosition({
                "symbol": "XBTUSD"
            });
            let position = posResults[0];
            if (position.currentQty >= 0) {
                // exit from position
                let exitResult = await bitmex.setOrder({
                    "symbol": "XBTUSD",
                    "execInst": "Close"
                });
                // cancel all orders
                let cancelResult = await bitmex.cancelOrder({ "symbol": "XBTUSD" });
                let levResult = await bitmex.setLeverage({
                    "symbol": "XBTUSD",
                    "leverage": leverage || "5"
                });
                let wallSummary = await bitmex.walletSummary();
                let balance = parseFloat(wallSummary.pop().walletBalance);
                let bid = (balance * pctPerPos * (leverage || 5)) / 100000000;
                let instResult = await bitmex.getInstrument();
                let lastPrice = parseFloat(instResult[0].lastPrice);
                let contractQty = parseInt(lastPrice * bid);
                let sellPrice = parseInt(lastPrice * ( 1 + priceDiff)); // 1.005
                let sellOrderResult = await bitmex.setOrder({
                    "symbol": "XBTUSD",
                    "side": "Sell",
                    "ordType": "Limit",
                    "orderQty": contractQty,
                    "price": sellPrice
                });

                let interId = setInterval(async () => {
                    let orders = await bitmex.getOrder({
                        "symbol": "XBTUSD",
                        "count": "5",
                        "reverse": "true"
                    });
                    let lastOrd = orders[0];
                    if (lastOrd.orderQty === contractQty && lastOrd.ordStatus === "Filled") {
                        emitter.emit('ShortFinalStep', {
                            contractQty,
                            sellPrice
                        });
                        clearInterval(interId);
                    }
                }, 5000);
            }

        } catch (err) {
            console.log(err); // store to mongodb
            await mongo.insert('Errors', { "exchange": "bitmex", "error": err });
        }
    }
    const openLong = async () => { //TODO: add custom params for function
        
        try {
            let posResults = await bitmex.getPosition({
                "symbol": "XBTUSD"
            });
            let position = posResults[0];
            if (position.currentQty <= 0) {
                // exit from position
                let exitResult = await bitmex.setOrder({
                    "symbol": "XBTUSD",
                    "execInst": "Close"
                });
                // cancel all orders
                let cancelResult = await bitmex.cancelOrder({ "symbol": "XBTUSD" });
                let levResult = await bitmex.setLeverage({
                    "symbol": "XBTUSD",
                    "leverage": leverage || "5"
                });
                let wallSummary = await bitmex.walletSummary();

                let balance = parseFloat(wallSummary.pop().walletBalance); // get satoshi balance, should be divided by 1 000 000 00          
                let bid = (balance * pctPerPos * (leverage || 5)) / 100000000;
                let instResult = await bitmex.getInstrument();
                let lastPrice = parseFloat(instResult[0].lastPrice);
                let contractQty = parseInt(lastPrice * bid); // store to mongo       
                let buyPrice = parseInt(lastPrice * ( 1 - priceDiff)); // store to mongo      
                let buyOrderResult = await bitmex.setOrder({
                    "symbol": "XBTUSD",
                    "side": "Buy",
                    "ordType": "Limit",
                    "orderQty": contractQty,
                    "price": buyPrice
                });

                let interId = setInterval(async () => {
                    let orders = await bitmex.getOrder({
                        "symbol": "XBTUSD",
                        "count": "5",
                        "reverse": "true"
                    });
                    let lastOrd = orders[0];

                    if (lastOrd.orderQty === contractQty && lastOrd.ordStatus === "Filled") {
                        emitter.emit('LongFinalStep', {
                            contractQty,
                            buyPrice
                        });
                        clearInterval(interId);
                    }
                }, 5000);
            }
        } catch (err) {
            console.log(err); // store to mongodb
            await mongo.insert('Errors', { "exchange": "bitmex", "error": err });
        }
    }

    return {
        openLong,
        openShort
    }   
}


module.exports = BitMEXClient;

