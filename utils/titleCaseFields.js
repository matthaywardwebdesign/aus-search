const titleCase = require('./titleCase.js');

module.exports = ( fields, data ) => {
  const newData = {};
  const keys = Object.keys( data );
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if ( fields[key] ) {
      newData[key] = titleCase(data[key]);
    } else {
      newData[key] = data[key];
    }
  }
  return newData;
};
