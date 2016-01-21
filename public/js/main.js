var map;



  var addMarkers = function(){
  // makes marker
    $.ajax({
      url: '/current',
      type: 'get',
      dataType: 'json'
    }).then(function(response){

      response.forEach(function(station){
        var marker = new google.maps.Marker({
          // set the position to the latitude and longitude
          position: {lat: station.lat, lng: station.lng},
          // the map I defined
          map: map,
          title: JSON.stringify(station.stationId)
        });
        marker.addListener('click',toggleInfo)
        marker.set('id',station.stationId)
      })
    })
  };

  function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: +40.7258960, lng: -73.9758670},
      zoom: 14
    });
    addMarkers();
  };

  var toggleInfo = function(event){
    console.log(this.title)
  }
