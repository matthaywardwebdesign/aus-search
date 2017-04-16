const db = require('./utils/db.js');
const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
  host: 'localhost:9200'
});

db( db => {
  const cursor = db.collection( 'AddressSimple' ).find({});
  getNext( cursor, () => {
    console.log( 'Completed' );
    db.close();
  });
});

let batch = [];
let count = 0;

getNext = ( cursor, callback ) => {
  cursor.nextObject( (err, doc) => {
    if ( err || !doc ) {
      callback();
      return;
    }

    if ( batch.length < 1000 ) {
      batch.push( doc );
      getNext( cursor );
    } else {
      insertDocs( batch, () => {
        batch = [];
        getNext( cursor );
      });
    }
  });
}

insertDocs = ( docs, callback ) => {
  const batchData = [];
  let left = docs.length;
  docs.forEach( ( doc, i ) => {
    delete doc._id;
    batchData.push({
      index: {
        _index: "address",
        _type: "singleAddress",
      }
    });
    batchData.push( doc );
  });

  client.bulk({
    body: batchData
  }, ( err, resp, status ) => {
    count+= docs.length;
    if ( count % 1000 === 0 ) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write( `${count} records imported` );
    }
    callback();
  });
}
