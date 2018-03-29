'use strict';

const bitmex = require('../api');
const percentPerPos = 0.2; // 20% of current balance


const posIsOpen = async () => {    
    let posResults = await bitmex.getPosition({ "symbol": "XBTUSD" });  
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
    let posResult = posIsOpen(); // TODO: strore result to mongodb
    let levResult = bitmex.setLeverage({ "symbol": "XBTUSD", "leverage": leverage || "5" }); //TODO: store result to mongodb
    let wallSummary = await bitmex.walletSummary();
    let balance = parseFloat(wallSummary.pop().walletBalance); // get satoshi balance
    let bid = balance * percentPerPos * (leverage || 5);
}


(async () => {
    try {
        var time = new Date();
        let done = await enterLongPos({});
        console.log(done);
        console.log(new Date() - time);
    } catch(err) {
        console.log(err);
    }
})();

setTimeout(() => {

}, 10000);
