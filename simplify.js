/* Import dependencies */
const async = require('async');
const database = require('./utils/db.js');
const Batch = require('./lib/Batch.js');
const Simplifier = require('./lib/Simplifier.js');

/* Import all the models */
const State = require('./models/State.js');
const LocalityClass = require('./models/LocalityClass.js');
const StreetType = require('./models/StreetType.js');
const Locality = require('./models/Locality.js');
const Location = require('./models/Location.js');
const Street = require('./models/Street.js');
const FlatType = require('./models/FlatType.js');
const Address = require('./models/Address.js');
const AddressType = require('./models/AddressType.js');

/* Create a variable to store the database connection */
let db = null;

/* Create a variable to store the small data that can be fetched all at once */
let smallData = null;

/* Attempt to get a database connection */
database( database => {
  db = database;
  /* Retrieve the small data that doesn't need to be processed one item at a time like states and data types */
  getSmallData( data => {
    smallData = data;
    /* Now that we have the small data let's store the simple states in the database */
    storeDataInCollection( 'StateSimple', smallData.states, () => {
      /* Now it's time to go through all of the other data and process it */
      simplifyAndStoreLocality(() => {
        simplifyAndStoreStreet(() => {
          //simplifyAndStoreAddress(() => {
            /* We are all done, let's close the database connection */
            db.close();
          //});
        });
      });
    });
  });
});

/* This function goes off and fetches all the small bits of data we will need to reference when processing the larger tables */
getSmallData = callback => {
  /* Go off and fetch the data in parallel */
  async.parallel([
    callback => getResolvedDocument( 'state', State, callback),
    callback => getResolvedDocument( 'localityClass', LocalityClass, callback),
    callback => getResolvedDocument( 'streetType', StreetType, callback),
    callback => getResolvedDocument( 'flatType', FlatType, callback),
    callback => getResolvedDocument( 'addressType', AddressType, callback),
  ], ( err, results ) => {
    /* Now that we have results, let's collate the data and return it via the callback */
    const data = {
      states: results[0],
      localityTypes: results[1],
      streetTypes: results[2],
      flatTypes: results[3],
      addressTypes: results[4],
    };
    callback( data );
  });
}

/* This function stores the provided data in the specified collection */
storeDataInCollection = ( collectionName, data, callback ) => {
  /* Get the collection */
  const collection = db.collection( collectionName );

  /* Delete any existing items */
  collection.deleteMany({}, (err, response) => {
    /* Insert the new items */
    collection.insert( data, {
      ordered: false,
    }, () => {
      callback();
    });
  });
}

/* This function converts all the documents in a specified collection to the specified model */
getResolvedDocument = ( collection, objectType, callback ) => {
  db.collection( collection ).find({}).toArray((err, response) => {
    const types = response.map( doc => new objectType( doc ));
    callback( err, types );
  });
}

simplifyAndStoreLocality = callback => {
  const simplifier = new Simplifier( 'locality', 'LocalitySimple', ( doc, resolved ) => {
    /* Create a new Locality object from the document */
    const l = new Locality( doc );

    /* Pull any data required from smallData */
    l.setClassCode( smallData.localityTypes.find( t => t.id === doc.locality_class_code ));
    l.setState( smallData.states.find( s => s.id === doc.state_pid ));

    /* Fetch the location for this locality from the database */
    getLocationLocality( l.id, location => {
      /* Store the fetched location in the locality */
      l.setLocation( location );

      /* Return the item */
      resolved( l );
    });
  }, callback);

  simplifier.setDatabase( db );
  simplifier.run();
}

simplifyAndStoreStreet = callback => {
  const simplifier = new Simplifier( 'streetLocality', 'StreetSimple', ( doc, resolved ) => {
    /* Create a new Street object from the document */
    const s = new Street( doc );

    /* Pull any data required from smallData */
    s.setType( smallData.streetTypes.find( t => t.id === doc.street_type_code ));

    /* Get the locality for this street */
    getLocality( doc.locality_pid, locality => {
      s.setLocality( locality );
      resolved( s );
    });
  }, callback);

  simplifier.setDatabase( db );
  simplifier.run();
}

const localityCache = {};

getLocality = ( id, callback ) => {
  if ( !localityCache[id] ) {
    const collection = db.collection( 'LocalitySimple' );
    collection.findOne({ id }, (err, doc) => {
      if ( !doc ) {
        callback(null);
        return;
      }
      localityCache[id] = doc;
      callback(doc);
    });
  } else {
    callback( localityCache[id] );
  }
}

simplifyAndStoreAddress = callback => {
  const newCollection = db.collection( 'AddressSimple' );
  newCollection.deleteMany({}, (err, response) => {
    console.log( 'Started simplyifying addresses' );
    const stream = db.collection( 'addressDetail' ).find({}).stream();
    let count = 0;
    let remaining = 0;
    stream.on('error', function (err) {
      console.error(err);
    });
    stream.on('data', function (doc) {
      remaining++;
      /* Process each document */
      const a = new Address();
      a.setID(doc.address_detail_pid);
      a.setDateCreated(doc.date_created);
      a.setDateRetired(doc.date_retired);
      a.setBuildingName(doc.building_name);
      a.setLot(`${doc.lot_number_prefix}${doc.lot_number}${doc.lot_number_suffix}`);
      a.setFlat(`${doc.flat_number_prefix}${doc.flat_number}${doc.flat_number_suffix}`);
      a.setFlatType(smallData.flatTypes.find( t => t.id === doc.flat_type_code ));
      a.setLevel(`${doc.level_number_prefix}${doc.level_number}${doc.level_number_suffix}`);
      a.setNumberFirst(`${doc.number_first_prefix}${doc.number_first}${doc.number_first_suffix}`);
      a.setNumberLast(`${doc.number_last_prefix}${doc.number_last}${doc.number_last_suffix}`);
      a.setPostcode(doc.postcode);

      /* Get the location for this locality */
      getStreet( doc.street_locality_pid, street => {
        a.setStreet( street );
        if ( street ) {
          a.setLocality( street.locality );
        }
        a.createFormattedAddress();
        getAddressSite( doc.address_site_pid, site => {
          if ( site != null ) {
            a.setAddressType(smallData.addressTypes.find( t => t.id === site.address_type ));
          }
          getAddressLocation( doc.address_detail_pid, location => {
            a.setLocation( location );
            newCollection.insert( a, () => {
              count++;
              remaining--;
              if ( count % 500 === 0 ) {
                process.stdout.clearLine();
                process.stdout.cursorTo(0);
                process.stdout.write( `${count} records processed` );
              }
            });
          })
        });
      });
    });
    stream.on('end', function () {
      const timer = setInterval(() => {
        if ( remaining == 0 ) {
          clearInterval( timer );
          console.log( `${count >= 500 ? '\n' : ''}Finished simplifying addresses` );
          callback();
        }
      }, 100);
    });
  });
}

/* Returns a location locality from ID */
getLocationLocality = ( id, callback ) => {
  const collection = db.collection( 'localityLatLng' );
  collection.findOne({ locality_pid: id}, (err, doc) => {
    if ( !doc ) {
      callback(null);
      return;
    }

    callback( new Location( doc ));
  });
}

const streetCache = {};

getStreet = ( id, callback) => {
  if ( !streetCache[id] ) {
    const collection = db.collection( 'StreetSimple' );
    collection.findOne({ id }, (err, doc) => {
      if ( !doc ) {
        callback(null);
        return;
      }
      streetCache[id] = doc;
      callback(doc);
    });
  } else {
    callback( streetCache[id] );
  }
}

getAddressSite = ( id, callback) => {
  const collection = db.collection( 'addressSite' );
  collection.findOne({ address_site_pid: id }, (err, doc) => {
    if ( !doc ) {
      callback(null);
      return;
    }

    callback(doc);
  });
}

getAddressLocation = ( id, callback) => {
  const collection = db.collection( 'addressGeocode' );
  collection.findOne({ address_detail_pid: id }, (err, doc) => {
    if ( !doc ) {
      callback(null);
      return;
    }

    let l = new Location();
    l.setLat(doc.latitude);
    l.setLng(doc.longitude);
    callback(l);
  });
}
