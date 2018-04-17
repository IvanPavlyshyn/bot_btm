'use strict';

const MongoClient = require('mongodb').MongoClient;
const moment = require('moment');
const  { MONGO_DB_NAME, MONGO_DB_URL, MONGO_DB_PASS } = require('../../config');

// 'heroku_vh901gld'
let MongoDb = (() => {    
    const created = moment().format();
    let client = null;    
    connect();    

    function connect()  { 
        console.log(`Connected to dbName: ${MONGO_DB_NAME}`);
        return new MongoClient(MONGO_DB_URL, { auth: { user:  MONGO_DB_NAME, password: MONGO_DB_PASS } })
            .connect().then(_client => client = _client);                        
    }
    
    function get(collName, query) {       
        return client.db(MONGO_DB_NAME).collection(collName).find(query).toArray();
    }

    function insert(collName, docs) {
        return client.db(MONGO_DB_NAME).collection(collName).insert(docs);
    }

    function update(collName, filter, update, options) {
        return client.db(MONGO_DB_NAME).collection(collName).updateMany(filter, update, options);
    }

    function remove(collName, filter, options) {
        return client.db(MONGO_DB_NAME).collection(collName).deleteMany(filter, options);
    }

    function close() {
        return client.close();
    }    

    return {       
        connect,
        get,
        insert,
        update,
        remove,
        close
    }

})();

/*
setTimeout(() => {
    MongoDb.insert('Users', {
        "user":"alex",
        "pass": "testnet",
        "apiKey": "etPgAv0KlTRsTwdYBmzgY-Go",
        "apiSecret":"g22D1OHv85DCOjhj2LJEiLJ2PZJQsXEH5nWfo0cGquqNkYhG"
    });
}, 5000); */




module.exports = MongoDb;