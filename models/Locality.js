class Locality {
  constructor() {
    this.id = "";
    this.dateCreated = null;
    this.dateRetired = null;
    this.name = "";
    this.classCode = null;
    this.state = null;
    this.location = null;
  }

  setID( id ) {
    this.id = id;
  }

  setDateCreated( date ) {
    this.dateCreated = date;
  }

  setDateRetired( date ) {
    this.dateRetired = date;
  }

  setName( name ) {
    this.name = name;
  }

  setClassCode( code ) {
    this.classCode = code;
  }

  setState( state ) {
    this.state = state;
  }

  setLocation( location ) {
    this.location = location;
  }
}

module.exports = Locality;
