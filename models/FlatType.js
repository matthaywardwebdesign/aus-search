class FlatType {
  constructor( doc ) {
    this.id = "";
    this.name = "";
    this.description = "";

    if ( doc ) {
      this.id = doc.code;
      this.name = doc.name;
      this.description = doc.description;
    }
  }

  setID( id ) {
    this.id = id;
  }

  setName( name ) {
    this.name = name;
  }

  setDescription( description ) {
    this.description = description;
  }
}

module.exports = FlatType;
