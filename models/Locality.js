class Locality {
  constructor( doc ) {
    this.id = "";
    this.dateCreated = null;
    this.dateRetired = null;
    this.name = "";
    this.classCode = null;
    this.state = null;
    this.location = null;

    if ( doc ) {
      this.id = doc.locality_pid;
      this.dateCreated = doc.date_created;
      this.dateRetired = doc.date_retired;
      this.name = doc.locality_name;
    }
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
