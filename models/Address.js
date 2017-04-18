class Address {
  constructor( doc ) {
    this.id = "";
    this.dateCreated = null;
    this.dateRetired = null;
    this.buildingName = "";
    this.lot = "";
    this.flat = "";
    this.flatType = null;
    this.level = "";
    this.numberFirst = "";
    this.numberLast = "";
    this.street = null;
    this.postcode = "";
    this.addressType = null;
    this.formattedAddress = "";
    this.location = null;

    if ( doc ) {
      this.id = doc.address_detail_pid;
      this.dateCreated = doc.date_created;
      this.dateRetired = doc.date_retired;
      this.buildingName = doc.building_name;
      this.lot = `${doc.lot_number_prefix}${doc.lot_number}${doc.lot_number_suffix}`;
      this.flat = `${doc.flat_number_prefix}${doc.flat_number}${doc.flat_number_suffix}`;
      this.level = `${doc.level_number_prefix}${doc.level_number}${doc.level_number_suffix}`;
      this.numberFirst = `${doc.number_first_prefix}${doc.number_first}${doc.number_first_suffix}`;
      this.numberLast = `${doc.number_last_prefix}${doc.number_last}${doc.number_last_suffix}`;
      this.postcode = doc.postcode;
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

  setBuildingName( name ) {
    this.buildingName = name;
  }

  setLot( lot ) {
    this.lot = lot;
  }

  setFlat( flat ) {
    this.flat = flat;
  }

  setFlatType( type ) {
    this.flatType = type;
  }

  setLevel( level ) {
    this.level = level;
  }

  setNumberFirst( number ) {
    this.numberFirst = number;
  }

  setNumberLast( number ) {
    this.numberLast = number;
  }

  setStreet( street ) {
    this.street = street;
  }

  setPostcode( postcode ) {
    this.postcode = postcode;
  }

  setAddressType( type ) {
    this.addressType = type;
  }

  setLocation( location ) {
    this.location = location;
  }

  createFormattedAddress() {
    const building = ( this.buildingName ) ? `${this.buildingName} ` : '';
    const flat = ( this.flat ) ? `${this.flat}/` : '';
    const number = ( this.numberLast ) ? `${this.numberFirst} - ${this.numberLast}` : this.numberFirst;
    const street = `${this.street.name} ${this.street.type ? this.street.type.name : ''}`;
    const locality = this.street.locality.name;
    const state = this.street.locality.state.abbreviation;
    const postcode = this.postcode;
    this.formattedAddress = `${building}${flat}${number} ${street}, ${locality}, ${state} ${postcode}, Australia`;
  }
}

module.exports = Address;
