/* Include dependencies */
const titleCase = require('./titleCase.js');

/* This function converts the values specified in the data provided to be in title case form */
module.exports = ( fields, data ) => {
  /* Create a new object to store the transformed data */
  const newData = {};
  /* Get all of the keys for the object */
  const keys = Object.keys( data );
  /* Loop through the keys and convert the required values to be title case */
  keys.forEach( key => {
    newData[key] = ( fields[key] ) ? titleCase( data[key] ) : data[key];
  });
  /* Return the transformed data */
  return newData;
};
