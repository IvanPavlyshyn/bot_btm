'use strict';

const MongoClient = require('mongodb').MongoClient;
const DB_NAME = require('../../config').MONGO_DB_NAME;
const DB_URL = require('../../config').MONGO_URL;
const DB_PASS = require('../../config').MONGO_DB_PASS;
const moment = require('moment');

// 'heroku_vh901gld'
let MongoDb = (() => {    
    const created = moment().format();
    let client = null;    
    connect();    

    function connect()  { 
        console.log(`Connected to dbName: ${DB_NAME}`);
        return new MongoClient(DB_URL, { auth: { user:  DB_NAME, password: DB_PASS } })
            .connect().then(_client => client = _client);                        
    }
    
    function get(collName, query) {       
        return client.db(DB_NAME).collection(collName).find(query).toArray();
    }

    function insert(collName, docs) {
        return client.db(DB_NAME).collection(collName).insert(docs);
    }

    function update(collName, filter, update, options) {
        return client.db(DB_NAME).collection(collName).updateMany(filter, update, options);
    }

    function remove(collName, filter, options) {
        return client.db(DB_NAME).collection(collName).deleteMany(filter, options);
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


module.exports = MongoDb;