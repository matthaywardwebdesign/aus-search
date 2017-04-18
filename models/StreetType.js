const titleCase = require('../utils/titleCase.js');

class StreetType {
  constructor( doc ) {
    this.id = "";
    this.name = "";
    this.description = "";
    this.longName = "";

    if ( doc ) {
      this.id = doc.code;
      this.longName = titleCase( this.id );
      this.name = doc.name;
      this.description = doc.description;
    }
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
