module.exports = data => {
  const newData = {};
  const keys = Object.keys( data );
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    newData[key.toLowerCase()] = data[key];
  }
  return newData;
}
