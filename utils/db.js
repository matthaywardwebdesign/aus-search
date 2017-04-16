const mongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/aus-address-search';

module.exports = callback => {
  mongoClient.connect(url, {
    bufferMaxEntries: 10000, autoReconnect: true, poolSize: 20, connectTimeoutMS: 300000, socketTimeoutMS: 300000
  }, (err, db) => {
    console.log("Connected correctly to server.");
    if ( !err ) {
      callback( db );
    }
  });
};
