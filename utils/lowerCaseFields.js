/* This function converts all of the keys in the specified object to be lowercase */
module.exports = data => {
  /* Create a new object to store the transformed data */
  const newData = {};
  /* Get all the of the keys for the object */
  const keys = Object.keys( data );
  keys.forEach( key => {
    /* Convert each key to be lowercase */
    newData[key.toLowerCase()] = data[key];
  });
  /* Return the transformed data */
  return newData;
}
