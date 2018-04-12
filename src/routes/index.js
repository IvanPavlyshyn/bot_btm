'use strict';

const BitMEX = require('../client');
const db = require('../db');

const Router = app => {

    app.get('/', (req, res) => res.end(`url: ${req.url} | index route`));    

    app.post('/testnet', async (req, res) => {
        let token = req.query.Token || req.query.token;
        let type = req.body.type || req.body.Type;
        const result = await mongo.get('Users', {});
        result.map(profile => {
            if(profile.token === token && type === "long") BitMEX(req.body, profile).openLong();
            else if(profile.token === token && type === "short") BitMEX(req.body, profile).openShort();
            else console.log(`TOKEN: ${profile.token === token} and TYPE: ${(type === "long") || (type === "short")}`);
        });
    });

    app.post('/testnet/long', async (req, res) => {
        let { userName, passWord } = req.body;
        const result = await mongo.get('Users', { user: userName, pass: passWord });
        result.length ? res.json({ position: "long", status: "ok"}) : res.json({ position: "long", error: "empty profile"});
        const profile = result.pop();   
        profile.apiUrl = false;
        BitMEX(req.body, profile).openLong();        
    });

    app.post('/testnet/short', async (req, res) => {
        let { userName, passWord } = req.body;
        const result = await mongo.get('Users', { user: userName, pass: passWord });
        result.length ? res.json({ position: "long", status: "ok"}) : res.json({ position: "long", error: "empty profile"});
        const profile = result.pop(); 
        profile.apiUrl = false;  
        BitMEX(req.body, profile).openShort();       
    });

    app.post('/bitmex', async (req, res) => {
        let token = req.query.Token || req.query.token;
        let type = req.body.type || req.body.Type;
        const result = await mongo.get('Users', {});
        result.map(profile => {
            if(profile.token === token && type === "long") BitMEX(req.body, profile).openLong();
            else if(profile.token === token && type === "short") BitMEX(req.body, profile).openShort();
            else console.log(`TOKEN: ${profile.token === token} and TYPE: ${(type === "long") || (type === "short")}`);
        });
    });

    app.post('/bitmex/long', async (req, res) => {
        let { userName, passWord } = req.body;
        const result = await mongo.get('Users', { user: userName, pass: passWord });
        result.length ? res.json({ position: "long", status: "ok"}) : res.json({ position: "long", error: "empty profile"});
        const profile = result.pop();   
        profile.apiUrl = false;
        BitMEX(req.body, profile).openLong();
    });

    app.post('/bitmex/short', async (req, res) => {
        let { userName, passWord } = req.body;
        const result = await mongo.get('Users', { user: userName, pass: passWord });
        result.length ? res.json({ position: "long", status: "ok"}) : res.json({ position: "long", error: "empty profile"});
        const profile = result.pop(); 
        profile.apiUrl = false;  
        BitMEX(req.body, profile).openShort();
    });

}

module.exports = Router;