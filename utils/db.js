const mongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/aus-address-search';

module.exports = callback => {
  mongoClient.connect(url, (err, db) => {
    console.log("Connected correctly to server.");
    if ( !err ) {
      callback( db );
    }
  });
};
