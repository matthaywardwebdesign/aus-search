const readDataFile = require('./utils/readDataFile.js');
const _ = require('underscore');
const async = require('async');
const lowerCaseFields = require('./utils/lowerCaseFields.js');
const titleCaseFields = require('./utils/titleCaseFields.js');
const dateFormatFields = require('./utils/dateFormatFields.js');
const db = require('./utils/db.js');

/* Load the import config */
const importConfig = require('./config/import.json');

db( db => {
  async.eachSeries( importConfig.filter( i => i.enabled ), ( item, callback ) => {
    importFileIntoDatabase( db, item, callback );
  }, () => {
    console.log( 'Completed all' );
    db.close();
  });
});

function importFileIntoDatabase( db, item, callback ) {
  const collection = db.collection(item.collection);
  /* Delete any existing items */
  collection.deleteMany({}, (err, response) => {
    /* Get the array of files */
    const files = item.files ? item.files : [item.file];
    /* Fetch each file */
    async.eachSeries( files, ( file, callback ) => {
      console.log( `Importing ${item.collection} from ${file}` );
      /* Read the data file */
      let count = 0;
      readDataFile(file, entry => {
        count++;
        /* Format the item so it's a bit nicer */
        let formattedEntry = formatEntry(item, entry);
        /* Insert into the database */
        db.collection(item.collection).insertOne( formattedEntry );
        if ( count % 500 === 0 ) {
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          process.stdout.write( `${count} records imported` );
        }
      }, () => {
        console.log( `${count >= 500 ? '\n' : ''}Imported ${item.collection} from ${file}` );
        callback();
      });
    }, callback );
  });
}

function formatEntry( item, entry ) {
  let newEntry = entry;

  newEntry = lowerCaseFields(newEntry);

  if ( item.format != null && item.format === false ) {
    return newEntry;
  }

  newEntry = titleCaseFields({
    locality_name: true,
    name: true,
    description: true,
    state_name: true,
    building_name: true,
    street_name: true,
  }, newEntry);

  newEntry = dateFormatFields({
    date_created: true,
    date_retired: true,
    date_last_modified: true,
  }, newEntry);

  return newEntry;
}
