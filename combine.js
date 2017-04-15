const db = require('./utils/db.js');
const indexes = require('./config/combine.json');
const async = require('async');

db( db => {
  async.eachSeries( indexes, ( item, callback ) => {
    copyCollection( db, item, callback );
  }, () => {
    console.log( 'Completed all' );
    db.close();
  });
});

function copyCollection( db, item, callback ) {
  if ( !item.enabled ) {
    callback();
    return;
  }

  const { collection, from } = item;
  console.log( `Creating new collection - ${collection}` );
  const newCollection = db.collection( collection );
  newCollection.deleteMany({}, (err, response) => {
    let count = 0;
    async.eachSeries( from, ( oldCollectionName, callback ) => {
      const oldCollection = db.collection( oldCollectionName );
      const stream = oldCollection.find().stream();
      stream.on('error', function (err) {
        console.error(err)
      });
      stream.on('data', function (doc) {
        /* Insert the doc into the new collection */
        newCollection.insert(doc);
        count++;
        if ( count % 500 === 0 ) {
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          process.stdout.write( `${count} records imported` );
        }
      });
      stream.on('end', function () {
        console.log( `${count >= 500 ? '\n' : ''}Finished importing from - ${oldCollectionName}` );
        callback();
      });
    }, callback);
  });
}
