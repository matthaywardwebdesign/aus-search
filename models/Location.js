class Location {
  constructor( doc ) {
    this.type = "Point";
    this.coordinates = [];

    if ( doc ) {
      this.coordinates = [parseFloat(doc.longitude), parseFloat(doc.latitude)];
    }
  }
}

module.exports = Location;
