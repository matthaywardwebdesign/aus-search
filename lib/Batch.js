class Batch {
  constructor( limit ) {
    this.limit = limit;
    this.batch = [];
    this.batchFullHandler = null;
  }

  setLimit( limit ) {
    this.limit = limit;
  }

  setBatchFullHandler( callback ) {
    this.batchFullHandler = callback;
  }

  addItem( item ) {
    this.batch.push( item );

    if ( this.batch.length >= this.limit ) {
      this.batchFullHandler( this.batch.slice() );
      this.batch = [];
    }
  }

  process() {
    if ( this.batch.length > 0 ) {
      this.batchFullHandler( this.batch.slice() );
      this.batch = [];
    }
  }
}

module.exports = Batch;
