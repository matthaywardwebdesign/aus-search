const db = require('./utils/db.js');
const indexes = require('./config/indexes.json');
const async = require('async');
const State = require('./models/State.js');
const LocalityClass = require('./models/LocalityClass.js');
const StreetType = require('./models/StreetType.js');
const Locality = require('./models/Locality.js');
const Location = require('./models/Location.js');

/* Let's simplify the dataset */
db( db => {
  getSmallData( db, smallData => {
    /* Now that we have the small data let's store the simple states in the database */
    storeSimpleStates( db, smallData.states, () => {
      /* Now it's time to go through all of the other data and process it */
      simplifyAndStoreLocality( db, smallData, () => {
        db.close();
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
  ], ( err, results ) => {
    const data = {};
    data.states = results[0];
    data.localityTypes = results[1];
    data.streetTypes = results[2];
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

simplifyAndStoreLocality = (db, smallData, callback) => {
  const newCollection = db.collection( 'LocalitySimple' );
  newCollection.deleteMany({}, (err, response) => {
    console.log( 'Started simplyifying locality' );
    const stream = db.collection( 'locality' ).find({}).stream();
    let count = 0;
    stream.on('error', function (err) {
      console.error(err);
    });
    stream.on('data', function (doc) {
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

        console.log( l );

        count++;
        if ( count % 500 === 0 ) {
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          process.stdout.write( `${count} records processed` );
        }
      });
    });
    stream.on('end', function () {
      console.log( `${count >= 500 ? '\n' : ''}Finished simplifying locality` );
      callback();
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
