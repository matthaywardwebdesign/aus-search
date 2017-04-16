class FlatType {
  constructor() {
    this.id = "";
    this.name = "";
    this.description = "";
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
