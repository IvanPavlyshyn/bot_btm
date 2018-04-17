'use strict';

const BitMEX = require('../client');
const mongo = require('../db');

const Router = app => {

    app.get('/', (req, res) => res.end(`url: ${req.url} | index route`));

    app.post('/user', async (req, res) => {
        // создать профайл на основе входящего Json тела или будет создан юзер по умолчанию если тело пустое(чисто для теста)
        let newProfile = req.body || {
            "user":"testName",
            "pass": "testnet",
            "apiKey": "etPgAv0KlTRsTwdYBmzgY-Go",
            "apiSecret":"g22D1OHv85DCOjhj2LJEiLJ2PZJQsXEH5nWfo0cGquqNkYhG"
        };
        let result = await mongo.insert('Users', newProfile);
        res.json(result);
    });

    app.post('/testnet', async (req, res) => {
        let token = req.query.Token || req.query.token;
        let type = req.body.type || req.body.Type;
        const result = await mongo.get('Users', {});
        result.map(profile => {
            if (profile.token === token && type === "long") BitMEX(req.body, profile).openLong();
            else if (profile.token === token && type === "short") BitMEX(req.body, profile).openShort();
            else console.log(`TOKEN: ${profile.token === token} and TYPE: ${(type === "long") || (type === "short")}`);
        });
    });

    app.post('/testnet/long', async (req, res) => {
        try {
            let { userName, passWord } = req.body;
            const result = await mongo.get('Users', { user: userName, pass: passWord });
            console.log(result[0]);
            result.length ? res.json({ position: "long", status: "ok" }) : res.json({ position: "long", error: "empty profile" });
            const profile = result.pop();
            profile.apiUrl = false;
            BitMEX(req.body, profile).openLong();
        } catch (err) {
            console.log(err);
            res.json(err);
        }
    });

    app.post('/testnet/short', async (req, res) => {
        try {
            let { userName, passWord } = req.body;
            const result = await mongo.get('Users', { user: userName, pass: passWord });
            console.log(result);
            result.length ? res.json({ position: "long", status: "ok" }) : res.json({ position: "long", error: "empty profile" });
            const profile = result.pop();
            profile.apiUrl = false;
            BitMEX(req.body, profile).openShort();
        } catch (err) {
            res.json(err);
        }
    });

    app.post('/bitmex', async (req, res) => {
        let token = req.query.Token || req.query.token;
        let type = req.body.type || req.body.Type;
        const result = await mongo.get('Users', {});
        result.map(profile => {
            if (profile.token === token && type === "long") BitMEX(req.body, profile).openLong();
            else if (profile.token === token && type === "short") BitMEX(req.body, profile).openShort();
            else console.log(`TOKEN: ${profile.token === token} and TYPE: ${(type === "long") || (type === "short")}`);
        });
    });

    app.post('/bitmex/long', async (req, res) => {
        let { userName, passWord } = req.body;
        const result = await mongo.get('Users', { user: userName, pass: passWord });
        result.length ? res.json({ position: "long", status: "ok" }) : res.json({ position: "long", error: "empty profile" });
        const profile = result.pop();
        profile.apiUrl = false;
        BitMEX(req.body, profile).openLong();
    });

    app.post('/bitmex/short', async (req, res) => {
        let { userName, passWord } = req.body;
        const result = await mongo.get('Users', { user: userName, pass: passWord });
        result.length ? res.json({ position: "long", status: "ok" }) : res.json({ position: "long", error: "empty profile" });
        const profile = result.pop();
        profile.apiUrl = false;
        BitMEX(req.body, profile).openShort();
    });

}

module.exports = Router;