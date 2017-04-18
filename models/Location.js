class Location {
  constructor( doc ) {
    this.lat = null;
    this.lng = null;

    if ( doc ) {
      this.lat = doc.latitude;
      this.lng = doc.longitude;
    }
  }

  setLat( lat ) {
    this.lat = lat;
  }

  setLng( lng ) {
    this.lng = lng;
  }
}

module.exports = Location;
