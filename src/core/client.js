"use strict";

const EventEmitter = require('events').EventEmitter;
const mongo = require('../db');

/*
* TODO:
* store api results to mongodb
* check or everything is filled and only after that we should set stop loss and profit orders || done!
* cancel previous stop and profit orders
* log errors to db
* add custom parameters
*/
const BitMEXClient = (data) => {
    const { priceDiff, pctPerPos, leverage, stopLossDiff, stopLoss, takeProfit } = data; 
    const bitmex = require('./bitmex-api');
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

    const openShort = async (data) => { //TODO: add custom params for function
             
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
    const openLong = async (data) => { //TODO: add custom params for function
        
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
        openShort,
        openLong
    }
}


let BitMEX = BitMEXClient({ priceDiff : 0.0025, pctPerPos: 0.2 , leverage: 5, stopLossDiff: 5, stopLoss: 0.02, takeProfit: 0.03 });

setTimeout(() => {
    (async () => { // simpleValue:-7661.5, currentQty:-7682 / short
        try {
            //await BitMEX.openShort();
            await BitMEX.openLong();

            const bitmex = require('./bitmex-api');
            /*
            await bitmex.setOrder({
                "symbol":"XBTUSD",
                "execInst": "Close"
            }); */
            /*
            let orders = await bitmex.getOrder({
                "symbol": "XBTUSD",
                "count": "5",
                "reverse": "true"
            });
            console.log(orders); 
            //let pos = await bitmex.getPosition();
            //console.log(pos); */
        } catch (err) {
            console.log(err);
        }
    })();
}, 3000);

module.exports = BitMEXClient;