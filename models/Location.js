class Location {
  constructor( doc ) {
    this.type = "Point";
    this.coordinates = [];

    if ( doc ) {
      this.coordinates = [doc.longitude, doc.latitude];
    }
  }
}

module.exports = Location;
