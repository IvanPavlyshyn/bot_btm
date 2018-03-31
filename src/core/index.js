'use strict';

const bitmex = require('../api');
const percentPerPos = 0.2; // 20% of current balance
const percentPerBuy = 1; //0.995;
const EventEmitter = require('events').EventEmitter;

const emitter = new EventEmitter();

emitter.on('StopLossAndProfit', async (data) => {
    console.log('emmited');
    try {
        let { contractQty, buyPrice } = data;
        let stopPrice = parseInt(buyPrice * 0.98);
        let stopOrd = {
            "symbol": "XBTUSD",
            "side": "Sell",
            "ordType": "StopLimit",
            "orderQty": contractQty,
            "price": stopPrice,
            "stopPx": stopPrice + 25
        };
        let stopOrdResult = await bitmex.setOrder(stopOrd); //TODO: store to mongodb
        console.log(stopOrdResult);
        let profitPrice = parseInt(buyPrice * 1.03);
        let profitOrd = {
            "symbol": "XBTUSD",
            "side": "Sell",
            "ordType": "Limit",
            "orderQty": contractQty,
            "price": profitPrice         
        };
        let profitOrdResult = await bitmex.setOrder(profitOrd); //TODO: store to mongodb
        console.log(profitOrdResult);
    } catch(err) {
        console.log(err);
    }
    //tadam!!!
});

const posIsOpen = async () => {
    let posResults = await bitmex.getPosition({
        "symbol": "XBTUSD"
    });
    let position = posResults[0];
    if (position.isOpen) {
        const currentQty = position.currentQty;
        const data = {
            "symbol": "XBTUSD",
            "side": "Buy",
            "ordType": "Market",
            "orderQty": currentQty
        }
        let ordResult = await bitmex.setOrder(data);
        return Promise.resolve(ordResult);
    } else return Promise.resolve(posResults);
}


const enterLongPos = async (data) => {
    const { leverage } = data;
    // first get position, if it's opened then post market order to exit
    try {
        let posResult = await posIsOpen(); // TODO: strore result to mongodb
        //console.log(posResult);
        let levResult = await bitmex.setLeverage({
            "symbol": "XBTUSD",
            "leverage": leverage || "5"
        }); //TODO: store result to mongodb
        //console.log(levResult);
        let wallSummary = await bitmex.walletSummary();
        //console.log(wallSummary);
        let balance = parseFloat(wallSummary.pop().walletBalance); // get satoshi balance, should be divided by 1 000 000 00
        //console.log(balance);
        let bid = (balance * percentPerPos * (leverage || 5)) / 100000000;
        let instResult = await bitmex.getInstrument(); // TODO: store result to mongodb
        //console.log(instResult);
        let lastPrice = parseFloat(instResult[0].lastPrice);
        //console.log(lastPrice);
        let contractQty = parseInt(lastPrice * bid); // store to mongo
        //console.log(contractQty);        
        let buyPrice = parseInt(lastPrice * percentPerBuy); // store to mongo
        //console.log(buyPrice);
        let buyOrderResult = await bitmex.setOrder({
            "symbol": "XBTUSD",
            "side": "Buy",
            "ordType": "Limit",
            "orderQty": contractQty,
            "price": buyPrice
        });
        //console.log(buyOrderResult);
        let interId = setInterval(async () => {
            let posResults = await bitmex.getPosition({
                "symbol": "XBTUSD"
            });
            let position = posResults[0];
            console.log(position);
            if (position.isOpen) {
                //console.log('opened');
                emitter.emit('StopLossAndProfit', {
                    contractQty,
                    buyPrice
                });
                clearInterval(interId);
            }
        }, 5000);
    } catch (err) {
        console.log(err);
    }
}


module.exports = { enterLongPos }

/*

(async () => {
    try {
        //var time = new Date();
        //let done = await enterLongPos({});
        //console.log(done);
        //console.log(new Date() - time);
        //let result = await inPosition();
        await enterLongPos({ "leverage": 5 });
        console.log('result');
    } catch (err) {
        console.log(err);
    }
})();

setTimeout(() => {

}, 160000); */
