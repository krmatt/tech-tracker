import React from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl-csp';
import MapboxWorker from 'worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker';

mapboxgl.workerClass = MapboxWorker;
mapboxgl.accessToken = 'pk.eyJ1IjoidHJtYXR0ayIsImEiOiJja210dGd2cjYwdXRzMnhzOTN1MDRsYnI2In0.OdQglh6qpMq-QQOm12p8Ng';

//var input = {
//    "features": [
//	{ "type": "Feature", "properties": { "id": 0,  "name": "Tech 3", "tsecs": 1592078400, "bearing": 0 }, "geometry": { "type": "Point", "coordinates": [ -115.606391900599817, 32.673693943392962 ] } },
//	{ "type": "Feature", "properties": {  "id": 0,  "name": "Tech 1", "bearing": 87.0, "tsecs": 1592078400  }, "geometry": { "type": "Point", "coordinates": [ -115.585908073767968, 32.679083641964432 ] } },
//	{ "type": "Feature", "properties": { "id": 0,   "name": "Tech 2", "bearing": 270, "tsecs": 1592078400 }, "geometry": { "type": "Point", "coordinates": [ -115.590876702138573, 32.676567128293193 ] } }
//    ]
//}
//
//var data = input.features

class Map extends React.Component { // class for the map
  constructor(props) {
    super(props);
    this.state = {
      lng: -115.61, // starting coordinates
      lat: 32.67,
      zoom: 12,
      poll: 0
    };
    this.mapContainer = React.createRef();
  }

  componentDidMount() {
    const {lng, lat, zoom} = this.state;
    const map = new mapboxgl.Map({
      container: this.mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom
    });

    this.updateCoords();

    map.on('move', () => { // get new map coordinates
      this.setState({
        lng: map.getCenter().lng.toFixed(4),
        lat: map.getCenter().lat.toFixed(4),
        zoom: map.getZoom().toFixed(2)
      });
    });
  }

  async updateCoords() { // get next set of location data
    var url = 'http://localhost:5000/' + this.state.poll; // CHANGE TO CONST?
    var response = await fetch(url);
    var data = await response.json();
    var locations = data.features;

    console.log(url);
    console.log(response);
    console.log(data);
    console.log(locations);

    locations.forEach(function(technician) {
      var el = document.createElement('div');
      el.className = 'marker';

      new mapboxgl.Marker(el)
        .setLngLat(technician.geometry.coordinates) // position
        .setRotation(technician.properties.bearing) // bearing
        .setPopup(new mapboxgl.popup({offset: 25})
        .setHTML('<h5>' + technician.properties.name + '</h5>'))
        .addTo(map)
    });

    this.setState({
      poll: this.state.poll + 1
    });
    console.log(this.state.poll); // DELETE BEFORE SUBMISSION
  }

  render() {
    const {lng, lat, zoom} = this.state;
    return (
      <div>
        <div className="sidebar">
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </div>
        <button className="poll-button" onClick={() => this.updateCoords()}>
          Update
        </button>
        <div ref={this.mapContainer} className="map-container" />
        </div>
    );
  }
}

// ===========================================

ReactDOM.render(
  <Map />,
  document.getElementById('app')
);
