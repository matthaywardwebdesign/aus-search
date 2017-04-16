const db = require('./utils/db.js');
const indexes = require('./config/indexes.json');
const async = require('async');
const State = require('./models/State.js');
const LocalityClass = require('./models/LocalityClass.js');
const StreetType = require('./models/StreetType.js');
const Locality = require('./models/Locality.js');
const Location = require('./models/Location.js');
const Street = require('./models/Street.js');
const FlatType = require('./models/FlatType.js');
const Address = require('./models/Address.js');
const AddressType = require('./models/AddressType.js');

/* Let's simplify the dataset */
db( db => {
  getSmallData( db, smallData => {
    /* Now that we have the small data let's store the simple states in the database */
    storeSimpleStates( db, smallData.states, () => {
      /* Now it's time to go through all of the other data and process it */
      simplifyAndStoreLocality( db, smallData, () => {
        simplifyAndStoreStreet( db, smallData, () => {
          simplifyAndStoreAddress( db, smallData, () => {
            db.close();
          });
        });
      });
    });
  });
});

/* This function goes off and fetches all the small bits of data we will need to reference when processing the larger tables */
getSmallData = (db, callback) => {
  async.parallel([
    callback => getSimplifiedStates(db, callback),
    callback => getSimplifiedLocalityClasses(db, callback),
    callback => getSimplifiedStreetTypes(db, callback),
    callback => getSimplifiedFlatTypes(db, callback),
    callback => getSimplifiedAddressTypes(db, callback),
  ], ( err, results ) => {
    const data = {};
    data.states = results[0];
    data.localityTypes = results[1];
    data.streetTypes = results[2];
    data.flatTypes = results[3];
    data.addressTypes = results[4];
    callback( data );
  });
}

/* This function returns the states in a simplied JSON format */
getSimplifiedStates = (db, callback) => {
  db.collection( 'state' ).find({}).toArray((err, response) => {
    const states = simplifyStates( response );
    callback( err, states );
  });
}

/* Converts the database entries into simplified State objects */
simplifyStates = states => {
  return states.map( state => {
    const s = new State();
    s.setID(state.state_pid);
    s.setDateCreated(state.date_created);
    s.setDateRetired(state.date_retired);
    s.setName(state.state_name);
    s.setAbbreviation(state.state_abbreviation);
    return s;
  });
}

storeSimpleStates = ( db, states, callback ) => {
  const collection = db.collection( 'StateSimple' );
  collection.deleteMany({}, (err, response) => {
    collection.insert( states, () => {
      callback();
    });
  });
}

/* This function returns the locality types in a simplied JSON format */
getSimplifiedLocalityClasses = (db, callback) => {
  db.collection( 'localityClass' ).find({}).toArray((err, response) => {
    const types = simplifyLocalityClasses( response );
    callback( err, types );
  });
}

/* Converts the database entries into simplified LocalityClass objects */
simplifyLocalityClasses = types => {
  return types.map ( type => {
    const t = new LocalityClass();
    t.setID(type.code);
    t.setName(type.name);
    return t;
  });
}

/* This function returns the street types in a simplied JSON format */
getSimplifiedStreetTypes = (db, callback) => {
  db.collection( 'streetType' ).find({}).toArray((err, response) => {
    const types = simplifyStreetTypes( response );
    callback( err, types );
  });
}

/* Converts the database entries into simplified StreetType objects */
simplifyStreetTypes = types => {
  return types.map ( type => {
    const t = new StreetType();
    t.setID(type.code);
    t.setName(type.name);
    t.setDescription(type.description);
    return t;
  });
}

/* This function returns the flat types in a simplied JSON format */
getSimplifiedFlatTypes = (db, callback) => {
  db.collection( 'flatType' ).find({}).toArray((err, response) => {
    const types = simplifyFlatTypes( response );
    callback( err, types );
  });
}

/* Converts the database entries into simplified StreetType objects */
simplifyFlatTypes = types => {
  return types.map ( type => {
    const t = new FlatType();
    t.setID(type.code);
    t.setName(type.name);
    t.setDescription(type.description);
    return t;
  });
}

/* This function returns the flat types in a simplied JSON format */
getSimplifiedAddressTypes = (db, callback) => {
  db.collection( 'addressType' ).find({}).toArray((err, response) => {
    const types = simplifyAddressTypes( response );
    callback( err, types );
  });
}

/* Converts the database entries into simplified StreetType objects */
simplifyAddressTypes = types => {
  return types.map ( type => {
    const t = new AddressType();
    t.setID(type.code);
    t.setName(type.name);
    t.setDescription(type.description);
    return t;
  });
}

simplifyAndStoreLocality = (db, smallData, callback) => {
  const newCollection = db.collection( 'LocalitySimple' );
  newCollection.deleteMany({}, (err, response) => {
    console.log( 'Started simplyifying locality' );
    const stream = db.collection( 'locality' ).find({}).stream();
    let count = 0;
    let remaining = 0;
    stream.on('error', function (err) {
      console.error(err);
    });
    stream.on('data', function (doc) {
      remaining++;
      /* Process each document */
      const l = new Locality();
      l.setID( doc.locality_pid );
      l.setDateCreated( doc.date_created );
      l.setDateRetired( doc.date_retired );
      l.setName( doc.locality_name );
      l.setClassCode( smallData.localityTypes.find( t => t.id === doc.locality_class_code ));
      l.setState( smallData.states.find( s => s.id === doc.state_pid ));

      /* Get the location for this locality */
      getLocationLocality( db, l.id, location => {
        l.setLocation( location );
        newCollection.insert( l, () => {
          count++;
          remaining--;
          if ( count % 500 === 0 ) {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write( `${count} records processed` );
          }
        });
      });
    });
    stream.on('end', function () {
      const timer = setInterval(() => {
        if ( remaining == 0 ) {
          clearInterval( timer );
          console.log( `${count >= 500 ? '\n' : ''}Finished simplifying locality` );
          callback();
        }
      }, 100);
    });
  });
}

getLocationLocality = (db, id, callback) => {
  const collection = db.collection( 'localityLatLng' );
  collection.findOne({ locality_pid: id}, (err, doc) => {
    if ( !doc ) {
      callback(null);
      return;
    }

    const l = new Location();
    l.setLat( doc.latitude );
    l.setLng( doc.longitude );
    callback(l);
  });
}

simplifyAndStoreStreet = (db, smallData, callback) => {
  const newCollection = db.collection( 'StreetSimple' );
  newCollection.deleteMany({}, (err, response) => {
    console.log( 'Started simplyifying streets' );
    const stream = db.collection( 'streetLocality' ).find({}).stream();
    let count = 0;
    let remaining = 0;
    stream.on('error', function (err) {
      console.error(err);
    });
    stream.on('data', function (doc) {
      remaining++;
      /* Process each document */
      const s = new Street();
      s.setID( doc.street_locality_pid );
      s.setDateCreated( doc.date_created );
      s.setDateRetired( doc.date_retired );
      s.setConfirmed( doc.street_class_code === 'C' );
      s.setName( doc.street_name );
      s.setType( smallData.streetTypes.find( t => t.id === doc.street_type_code ));

      /* Get the location for this locality */
      getLocality( db, doc.locality_pid, locality => {
        s.setLocality( locality );
        newCollection.insert( s, () => {
          count++;
          remaining--;
          if ( count % 500 === 0 ) {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write( `${count} records processed` );
          }
        });
      });
    });
    stream.on('end', function () {
      const timer = setInterval(() => {
        if ( remaining == 0 ) {
          clearInterval( timer );
          console.log( `${count >= 500 ? '\n' : ''}Finished simplifying streets` );
          callback();
        }
      }, 100);
    });
  });
}

const localityCache = {};

getLocality = (db, id, callback) => {
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

simplifyAndStoreAddress = (db, smallData, callback) => {
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
      getStreet( db, doc.street_locality_pid, street => {
        a.setStreet( street );
        if ( street ) {
          a.setLocality( street.locality );
        }
        a.createFormattedAddress();
        getAddressSite( db, doc.address_site_pid, site => {
          if ( site != null ) {
            a.setAddressType(smallData.addressTypes.find( t => t.id === site.address_type ));
          }
          getAddressLocation( db, doc.address_detail_pid, location => {
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

const streetCache = {};

getStreet = (db, id, callback) => {
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

getAddressSite = (db, id, callback) => {
  const collection = db.collection( 'addressSite' );
  collection.findOne({ address_site_pid: id }, (err, doc) => {
    if ( !doc ) {
      callback(null);
      return;
    }

    callback(doc);
  });
}

getAddressLocation = (db, id, callback) => {
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
