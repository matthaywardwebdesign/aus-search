class State {
  constructor( doc ) {
    this.id = "";
    this.dateCreated = null;
    this.dateRetired = null;
    this.name = "";
    this.abbreviation = "";

    if ( doc ) {
      this.id = doc.state_pid;
      this.dateCreated = doc.date_created;
      this.dateRetired = doc.date_retired;
      this.name = doc.state_name;
      this.abbreviation = doc.state_abbreviation;
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

  setAbbreviation( abbreviation ) {
    this.abbreviation = abbreviation;
  }
}

module.exports = State;
