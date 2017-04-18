class LocalityType {
  constructor( doc ) {
    this.id = "";
    this.name = "";

    if ( doc ) {
      this.id = doc.code;
      this.name = doc.name;
    }
  }

  setID( id ) {
    this.id = id;
  }

  setName( name ) {
    this.name = name;
  }
}

module.exports = LocalityType;
