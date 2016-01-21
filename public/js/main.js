var map;

var locations = [
// AJAX call to server to get location data
];

var addMarker = function(location){
  // makes marker
  var marker = new google.maps.Marker({
    // set the positon to the latitude and longitude
    position: location.location,
    // the map I defined
    map: map,
  });
};

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: +40.7258960, lng: -73.9758670},
    zoom: 14
  });
  locations.forEach(addMarker);
};