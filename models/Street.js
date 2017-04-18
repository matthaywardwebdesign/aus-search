class Street {
  constructor( doc ) {
    let id = "";
    let dateCreated = null;
    let dateRetired = null;
    let type = null;
    let name = "";
    let confirmed = null;
    let locality = null;

    if ( doc ) {
      this.id = doc.street_locality_pid;
      this.dateCreated = doc.date_created;
      this.dateRetired = doc.date_retired;
      this.confirmed = doc.street_class_code === 'C';
      this.name = doc.street_name;
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
