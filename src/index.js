import React from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl-csp';
import MapboxWorker from 'worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker';

mapboxgl.workerClass = MapboxWorker;
mapboxgl.accessToken = 'pk.eyJ1IjoidHJtYXR0ayIsImEiOiJja210dGd2cjYwdXRzMnhzOTN1MDRsYnI2In0.OdQglh6qpMq-QQOm12p8Ng';

var currentMarkers = [];

// class for the map
class Map extends React.Component {
  constructor(props) {
    super(props);
    // set starting coordinates
    this.state = {
      lng: -115.61,
      lat: 32.67,
      zoom: 12,
      poll: 0
    };
    this.mapContainer = React.createRef();
  }

  // create map
  async componentDidMount() {
    const {lng, lat, zoom} = this.state;
    const map = new mapboxgl.Map({
      container: this.mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom
    });

    // get initial locations from API
    var url = 'http://localhost:5000/' + this.state.poll;
    var response = await fetch(url);
    var data = await response.json();
    var locations = data.features;

    // create marker for each technician
    locations.forEach(function(technician) {
      var el = document.createElement('div');
      el.className = 'marker';

      var newMarker = new mapboxgl.Marker(el)
        .setLngLat(technician.geometry.coordinates)
        .setRotation(technician.properties.bearing)
        .setPopup(new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
        })
        .setText(technician.properties.name))
        .addTo(map)
      currentMarkers.push(newMarker);
    });

    this.setState({
      poll: this.state.poll + 1
    });

    // get new map coordinates when moved by user
    map.on('move', () => {
      this.setState({
        lng: map.getCenter().lng.toFixed(4),
        lat: map.getCenter().lat.toFixed(4),
        zoom: map.getZoom().toFixed(2),
      });
    });
  }

  async updateLocations() {
    // get new locations from API
    var url = 'http://localhost:5000/' + this.state.poll;
    var response = await fetch(url);
    var data = await response.json();
    var locations = data.features;

    // update marker locations or add new markers
    for (let i = 0; i < locations.length; i++) {
      currentMarkers[i]
        .setLngLat(locations[i].geometry.coordinates)
        .setRotation(locations[i].properties.bearing)
    };

    // notify when technicians are close to each other
    for (let i = 0; i < currentMarkers.length; i++) {
      for (var j = i; j < currentMarkers.length; j++) {
        if (i !== j) {
          const lat1 = currentMarkers[i].getLngLat().lat;
          const lng1 = currentMarkers[i].getLngLat().lng;
          const lat2 = currentMarkers[j].getLngLat().lat;
          const lng2 = currentMarkers[j].getLngLat().lng;
          if (haversineDist(lat1, lng1, lat2, lng2) < 1000) {
            currentMarkers[i]
              .setPopup(new mapboxgl.Popup({
                offset: 25,
                closeButton: false,
              })
              .setText(locations[i].properties.name + ' close to ' + locations[j].properties.name))
              .togglePopup()
          } else {
            currentMarkers[i]
              .setPopup(new mapboxgl.Popup({
                offset: 25,
                closeButton: false,
              })
              .setText(locations[i].properties.name))
            currentMarkers[j]
              .setPopup(new mapboxgl.Popup({
                offset: 25,
                closeButton: false,
              })
              .setText(locations[j].properties.name))
          };
        }
      }
    }

    this.setState({
      poll: this.state.poll + 1
    });
  }

  render() {
    const {lng, lat, zoom} = this.state;
    return (
      <div>
        <div className="sidebar">
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </div>
        <button className="poll-button" onClick={() => this.updateLocations()}>
          Update
        </button>
        <div ref={this.mapContainer} className="map-container" />
        </div>
    );
  }
}

// calculate Haversine distance between two GPS points
function haversineDist(lat1, lng1, lat2, lng2) {
  const earthRadiusFt = 20902259;

  const latDist = (lat1 - lat2) * Math.PI / 180;
  const lngDist = (lng1 - lng2) * Math.PI / 180;

  lat1 = lat1 * Math.PI / 180;
  lat2 = lat2 * Math.PI / 180;

  const a = (Math.sin(latDist / 2) ** 2) +
            (Math.sin(lngDist / 2) ** 2) *
            (Math.cos(lat1) * Math.cos(lat2));
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusFt * c;
}

// ===========================================

ReactDOM.render(
  <Map />,
  document.getElementById('app')
);
