const titleCase = require('../utils/titleCase.js');

class StreetType {
  constructor() {
    this.id = "";
    this.name = "";
    this.description = "";
    this.longName = "";
  }

  setID( id ) {
    this.id = id;
    this.longName = titleCase( id );
  }

  setName( name ) {
    this.name = name;
  }

  setDescription( description ) {
    this.description = description;
  }
}

module.exports = StreetType;
