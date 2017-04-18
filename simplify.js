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
          simplifyAndStoreAddress(() => {
            /* We are all done, let's close the database connection */
            db.close();
          });
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

simplifyAndStoreAddress = callback => {
  const simplifier = new Simplifier( 'addressDetail', 'AddressSimple', ( doc, resolved ) => {
    /* Create a new Address object from the document */
    const a = new Address( doc );

    /* Pull any data required from smallData */
    a.setFlatType( smallData.flatTypes.find( t => t.id === doc.flat_type_code ));

    /* Get the street for this address */
    getStreet( doc.street_locality_pid, street => {
      a.setStreet( street );

      /* Create the formatted address */
      a.createFormattedAddress();

      /* Get the address site */
      getAddressSite( doc.address_site_pid, site => {
        if ( site != null ) {
          a.setAddressType( smallData.addressTypes.find( t => t.id === site.address_type ));
        }

        /* Get the location for the address */
        getAddressLocation( doc.address_detail_pid, location => {
          a.setLocation( location );
          resolved( a );
        });
      });
    });
  }, callback);

  simplifier.setDatabase( db );
  simplifier.run();
}

/* Create a simple in memory cache for localities */
const localityCache = {};

getLocality = ( id, callback ) => {
  /* Check if the locality doesn't already exist in the cache */
  if ( !localityCache[id] ) {
    /* Find the locality in the collection */
    const collection = db.collection( 'LocalitySimple' );
    collection.findOne({ id }, (err, doc) => {
      /* If no document was found, return null */
      if ( !doc ) {
        callback(null);
        return;
      }

      /* Store the locality in the cache and return the document */
      localityCache[id] = doc;
      callback(doc);
    });
  } else {
    /* Locality is in the cache, return it */
    callback( localityCache[id] );
  }
}

/* Create a simple in memory cache for location localities */
const locationLocalityCache = {};

/* Returns a location locality from ID */
getLocationLocality = ( id, callback ) => {
  /* Check if the locality location doesn't already exist in the cache */
  if ( !locationLocalityCache[id] ) {
    /* Find the localities location in the collection */
    const collection = db.collection( 'localityLatLng' );
    collection.findOne({ locality_pid: id}, (err, doc) => {
      /* If no document was found, return null */
      if ( !doc ) {
        callback(null);
        return;
      }

      /* Store the location in the cache and return the document */
      locationLocalityCache[id] = new Location( doc );
      callback( locationLocalityCache[id] );
    });
  } else {
    callback( locationLocalityCache[id] );
  }
}

/* Create a simple in memory cache for streets */
const streetCache = {};

/* Returns a street from ID */
getStreet = ( id, callback) => {
  /* Check if the street doesn't already exist in the cache */
  if ( !streetCache[id] ) {
    /* Find the street in the collection */
    const collection = db.collection( 'StreetSimple' );
    collection.findOne({ id }, (err, doc) => {
      /* If no document was found, return null */
      if ( !doc ) {
        callback(null);
        return;
      }

      /* Store the street in the cache and return the document */
      streetCache[id] = doc;
      callback(doc);
    });
  } else {
    callback( streetCache[id] );
  }
}

/* Returns the site information for an address by ID */
getAddressSite = ( id, callback) => {
  /* Find the site in the collection */
  const collection = db.collection( 'addressSite' );
  collection.findOne({ address_site_pid: id }, (err, doc) => {
    /* If no document was found return null */
    if ( !doc ) {
      callback(null);
      return;
    }

    /* Return the document */
    callback(doc);
  });
}

/* Returns the location information for an address by ID */
getAddressLocation = ( id, callback) => {
  /* Find the location in the collection */
  const collection = db.collection( 'addressGeocode' );
  collection.findOne({ address_detail_pid: id }, (err, doc) => {
    /* If no document was found return null */
    if ( !doc ) {
      callback(null);
      return;
    }

    /* Return the document */
    callback( new Location( doc ));
  });
}
