/* Import dependencies */
const async = require('async');
const readDataFile = require('../utils/readDataFile.js');
const lowerCaseFields = require('../utils/lowerCaseFields.js');
const titleCaseFields = require('../utils/titleCaseFields.js');
const dateFormatFields = require('../utils/dateFormatFields.js');
const Batch = require('./Batch.js');

/* Create importer class */
class Importer {
  constructor() {
    this.db = null;
  }

  setDatabase( db ) {
    this.db = db;
  }

  importFile( item, callback ) {
    /* Create the database connection */
    const collection = this.db.collection( item.collection );

    /* Delete any existing items */
    collection.deleteMany({}, ( err, response ) => {
      /* Get the array of files */
      const files = item.files ? item.files : [item.file];

      /* Fetch each file */
      async.each( files, ( file, callback ) => {
        /* Create some variables to store statistics */
        let count = 0;

        /* Create a new batch with batch size of 10,000 */
        const batch = new Batch( 10000 );

        /* Set the batch full handler */
        batch.setBatchFullHandler( batchItems => {
          /* Insert the records into the database */
          batchInsert( this.db, item.collection, batchItems );

          /* Print stats */
          console.log( `${count} ${item.collection} records imported` );
        });

        console.log( `Importing ${item.collection} from ${file}` );

        /* Read the data file */
        readDataFile(file, entry => {
          /* Increment the count */
          count++;

          /* Format the item so it's a bit nicer */
          let formattedEntry = formatEntry(item, entry);

          /* Add the entry to the batch */
          batch.addItem( formattedEntry );
        }, () => {
          /* Process the batch once more to process any remaining items */
          batch.process();

          console.log( `\nImported ${item.collection} from ${file}` );
          callback();
        });
      }, callback );
    });
  }
}

/* Export the Importer class */
module.exports = Importer;

/* This function standardises fields */
formatEntry = ( item, entry ) => {
  entry = lowerCaseFields(entry);

  if ( item.format != null && item.format === false ) {
    return entry;
  }

  entry = titleCaseFields({
    locality_name: true,
    name: true,
    description: true,
    state_name: true,
    building_name: true,
    street_name: true,
  }, entry);

  entry = dateFormatFields({
    date_created: true,
    date_retired: true,
    date_last_modified: true,
  }, entry);

  return entry;
}

/* This function provides a method to batch insert documents into a collection */
batchInsert = ( db, collectionName, docs ) => {
  const collection = db.collection( collectionName );
  collection.insert( docs, {
    ordered: false,
  });
}
