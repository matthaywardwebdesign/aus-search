class State {
  constructor() {
    this.id = "";
    this.dateCreated = null;
    this.dateRetired = null;
    this.name = "";
    this.abbreviation = "";
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
