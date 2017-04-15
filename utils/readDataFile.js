const csv = require('csv-stream');
const fs = require('fs');

const options = {
  delimiter: '|',
};

module.exports = ( file, callback, done ) => {
  const csvStream = csv.createStream(options);
  fs.createReadStream(`${__dirname}/../${file}`).pipe( csvStream )
    .on('data',function(data){
      callback( data );
    })
    .on('end', done);
};
