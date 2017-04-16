class Address {
  constructor() {
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
    this.locality = null;
    this.postcode = "";
    this.addressType = null;
    this.formattedAddress = "";
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

  setLocality( locality ) {
    this.locality = locality;
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
    const number = ( this.numberLast ) ? `${this.numberFirst} ${this.numberLast}` : this.numberFirst;
    const street = `${this.street.name} ${this.street.type ? this.street.type.name : ''}`;
    const locality = this.locality.name;
    const state = this.locality.state.abbreviation;
    const postcode = this.postcode;
    this.formattedAddress = `${building}${flat}${number} ${street}, ${locality}, ${state} ${postcode}, Australia`;
  }
}

module.exports = Address;
