/* This function converts the specified fields to javascript dates in the data provided */
module.exports = ( fields, data ) => {
  /* Create an object to store the new data */
  const newData = {};
  /* Get all of the keys for the data */
  const keys = Object.keys( data );
  /* Loop through each of the keys */
  keys.forEach( key => {
    /* Convert the value to a data if needed */
    if ( fields[key] && data[key] != '' ) {
      newData[key] = new Date(data[key]);
    } else {
      newData[key] = data[key];
    }
  });
  /* Return the transformed data */
  return newData;
};
