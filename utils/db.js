const mongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/aus-address-search';

module.exports = callback => {
  mongoClient.connect(url, {
    bufferMaxEntries: 10000, autoReconnect: true, poolSize: 20, connectTimeoutMS: 300000, socketTimeoutMS: 300000
  }, (err, db) => {
    if ( !err ) {
      console.log( 'Connected to MongoDB server' );
      callback( db );
    } else {
      console.error( err );
    }
  });
};
