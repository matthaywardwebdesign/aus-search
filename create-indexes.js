/* Import dependencies */
const async = require('async');
const db = require('./utils/db.js');

/* Load the indexes config */
const indexes = require('./config/indexes.json');

/* Attempt to get a database connection */
db( db => {
  /* Loop through the list of required indexes and create them in the database */
  async.each( indexes, ( item, callback ) => {
    createDatabaseIndex( db, item, callback );
  }, () => {
    /* We have completed creating the indexes, close the database connection */
    console.log( 'Completed all' );
    db.close();
  });
});

/* This function creates a database index with the specified information */
createDatabaseIndex = ( db, item, callback ) => {
  const { collection, fields, name } = item;
  console.log( `Creating index - ${name}` );

  /* Create the index if it doesn't already exist */
  db.collection(collection).ensureIndex( fields, { background: true }, () => {
    console.log( `Created index - ${name}` );
    callback();
  });
}
