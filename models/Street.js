class Street {
  constructor() {
    let id = "";
    let dateCreated = null;
    let dateRetired = null;
    let type = null;
    let name = "";
    let confirmed = null;
    let locality = null;
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

  setType( type ) {
    this.type = type;
  }

  setName( name ) {
    this.name = name;
  }

  setConfirmed( confirmed ) {
    this.confirmed = confirmed;
  }

  setLocality( locality ) {
    this.locality = locality;
  }
}

module.exports = Street;
