const Batch = require('./Batch.js');

class Simplifier {
  constructor( from, to, docResolver, callback ) {
    this.db = null;
    this.from = from;
    this.to = to;
    this.docResolver = docResolver;
    this.callback = callback;
  }

  setDatabase( database ) {
    this.db = database;
  }

  run() {
    /* Create a new collection to store the locality documents */
    const newCollection = this.db.collection( this.to );

    /* Remove any existing documents in this collection */
    newCollection.deleteMany({}, (err, response) => {
      console.log( `Started simplifying ${this.from}` );

      /* Create some variables to store stats */
      let count = 0;
      let remaining = 0;

      /* Create a new Batch so we can do batch inserts */
      const batch = new Batch( 10000 );

      /* Set the batch full handler */
      batch.setBatchFullHandler( batchItems => {
        /* Insert the records into the database */
        batchInsert( this.db, this.to, batchItems, err => {
          remaining -= batchItems.length;
        });

        /* Print stats */
        console.log( `${count} ${this.to} records imported` );
      });

      /* Create a new stream from our input collection */
      const stream = this.db.collection( this.from ).find({}).stream();

      /* Log any errors that may occur */
      stream.on('error', err => {
        console.error(err);
      });

      /* Process any documents the may come through */
      stream.on('data', doc => {
        this.docResolver( doc, resolved => {
          /* Increment the count */
          count++;

          /* Increment the remaining count, we use this to check how many we have left to insert */
          remaining++;

          /* Add the item to the batch */
          batch.addItem( resolved );
        });
      });

      /* Listen for when the stream ends */
      stream.on('end', () => {

        /* There is probably a better way to do this, but this waits for all the records to be imported */
        const timer = setInterval(() => {
          /* Process the batch again to clear any remaining items */
          batch.process();

          if ( remaining == 0 ) {
            clearInterval( timer );
            console.log( `\nFinished simplifying ${this.from}` );
            this.callback();
          }
        }, 100);
      });
    });
  }
}

module.exports = Simplifier;

/* This function provides a method to batch insert documents into a collection */
batchInsert = ( db, collectionName, docs, callback ) => {
  const collection = db.collection( collectionName );
  collection.insert( docs, {
    ordered: false,
  }, callback);
}
