/* This function converts a string into it's title case form, for example MCDONALDS would become McDonalds */
module.exports = str => {
  return str.toLowerCase()
  .split(" ")
  .map(function(v){return v.charAt(0).toUpperCase() + v.slice(1)})
  .join(" ")
  .replace(/Mc(.)/g, function(match, next) {
    return 'Mc' + next.toUpperCase();
  });;
}
