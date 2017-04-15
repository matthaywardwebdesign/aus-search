const db = require('./utils/db.js');
const indexes = require('./config/indexes.json');
const async = require('async');

db( db => {
  async.eachSeries( indexes, ( item, callback ) => {
    createDatabaseIndex( db, item, callback );
  }, () => {
    console.log( 'Completed all' );
    db.close();
  });
});

function createDatabaseIndex( db, item, callback ) {
  const { collection, fields, name } = item;
  console.log( `Creating index - ${name}` );
  db.collection(collection).ensureIndex( fields, { background: true }, () => {
    console.log( `Created index - ${name}` );
    callback();
  });
}
