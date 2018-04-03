"use strict";

const EventEmitter = require('events').EventEmitter;

/*
* TODO:
* store api results to mongodb
* check or everything is filled and only after that we should set stop loss and profit orders
* cancel previous stop and profit orders
* log errors to db
* add custom parameters
*/
const BitMEXClient = (data) => {
    const { percentPerSell, percentPerPos, percentPerBuy } = data;    
    const bitmex = require('./bitmex-api');
    const emitter = new EventEmitter();

    emitter.on('LongFinalStep', async (data) => {
        try {
            let { contractQty, buyPrice } = data;
            let stopPrice = parseInt(buyPrice * 0.98);
            let stopOrd = {
                "symbol": "XBTUSD",
                "side": "Sell",
                "ordType": "StopLimit",
                "orderQty": contractQty,
                "price": stopPrice,
                "stopPx": stopPrice - 25
            };
            let stopOrdResult = await bitmex.setOrder(stopOrd);          
            let profitPrice = parseInt(buyPrice * 1.03);
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
        }
        //tadam!!!
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
                "stopPx": stopPrice + 25
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
        }
        //tadam!!!
    }); 

    const openShort = async (leverage) => {
        //const { leverage } = data;
        try {
            let posResults = await bitmex.getPosition({
                "symbol": "XBTUSD"
            });           
            let position = posResults[0];
            if (position.isOpen) {
                const posQty = position.currentQty;
                const data = {
                    "symbol": "XBTUSD",
                    "side": "Sell",
                    "ordType": "Market",
                    "orderQty": posQty
                }
                let ordResult = await bitmex.setOrder(data);
            }
            let levResult = await bitmex.setLeverage({
                "symbol": "XBTUSD",
                "leverage": leverage || "5"
            });
            let wallSummary = await bitmex.walletSummary();
            let balance = parseFloat(wallSummary.pop().walletBalance);
            let bid = (balance * percentPerPos * (leverage || 5)) / 100000000;
            let instResult = await bitmex.getInstrument();  
            let lastPrice = parseFloat(instResult[0].lastPrice);
            let contractQty = parseInt(lastPrice * bid);
            let sellPrice = parseInt(lastPrice * percentPerSell); // 1.005
            let sellOrderResult = await bitmex.setOrder({
                "symbol": "XBTUSD",
                "side": "Sell",
                "ordType": "Limit",
                "orderQty": contractQty,
                "price": sellPrice
            });

            let interId = setInterval(async () => {
                let posResults = await bitmex.getPosition({
                    "symbol": "XBTUSD"
                });
                let position = posResults[0];   
                console.log(position);        
                if (position.isOpen) {                 
                    emitter.emit('ShortFinalStep', {
                        contractQty,
                        sellPrice
                    });
                    clearInterval(interId);
                }
            }, 5000);

        } catch(err) {
            console.log(err);
        }
    }
    const openLong = async (leverage) => {        
        try {            
            let posResults = await bitmex.getPosition({
                "symbol": "XBTUSD"
            });           
            let position = posResults[0];
            console.log('first check');
            console.log(position);
            if (position.isOpen) {
                const posQty = position.currentQty;
                const data = {
                    "symbol": "XBTUSD",
                    "side": "Buy",
                    "ordType": "Market",
                    "orderQty": posQty
                }
                let ordResult = await bitmex.setOrder(data);
            }
            let levResult = await bitmex.setLeverage({
                "symbol": "XBTUSD",
                "leverage": leverage || "5"
            });           
            let wallSummary = await bitmex.walletSummary();

            let balance = parseFloat(wallSummary.pop().walletBalance); // get satoshi balance, should be divided by 1 000 000 00          
            let bid = (balance * percentPerPos * (leverage || 5)) / 100000000;
            let instResult = await bitmex.getInstrument();  
            let lastPrice = parseFloat(instResult[0].lastPrice);
            let contractQty = parseInt(lastPrice * bid); // store to mongo       
            let buyPrice = parseInt(lastPrice * percentPerBuy); // store to mongo      
            let buyOrderResult = await bitmex.setOrder({
                "symbol": "XBTUSD",
                "side": "Buy",
                "ordType": "Limit",
                "orderQty": contractQty,
                "price": buyPrice
            });

            let interId = setInterval(async () => { // currentQty:16802
                let posResults = await bitmex.getPosition({
                    "symbol": "XBTUSD"
                });
                let position = posResults[0];    
                console.log(position);       
                if (position.isOpen) { //FIXME:check or everything is filled and only after that we should put profit and stop loss orders                
                    /*emitter.emit('LongFinalStep', {
                        contractQty,
                        buyPrice
                    }); */
                    //clearInterval(interId);
                }
            }, 5000);
        } catch (err) {
            console.log(err);
        }
    }

    return {
        openShort,
        openLong
    }
}


let BitMEX = BitMEXClient({ percentPerBuy: "1", percentPerPos: "0.2", percentPerSell: "1" });

setTimeout(() => {
    (async () => {
        try {
            BitMEX.openLong();
        } catch (err) {
            console.log(err);
        }
    })();
}, 3000);

module.exports = BitMEXClient;