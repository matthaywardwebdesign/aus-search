/* Require dependencies */
const csv = require('csv-stream');
const fs = require('fs');

/* We are reading pipe seperated values */
const options = {
  delimiter: '|',
};

module.exports = ( file, callback, done ) => {
  /* Create a new csv (or in this case psv) stream */
  const csvStream = csv.createStream(options);
  csvStream._encoding = 'utf8';
  /* Read the specified file and pipe the data into the psv stream */
  fs.createReadStream(`${__dirname}/../${file}`).pipe( csvStream )
    .on('data', (data) => {
      /* Pass each entry to a callback function */
      callback( data );
    })
    .on('end', done);
};
