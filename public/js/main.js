var map;
var markers = [];
var bikeData
var currentData

var calculateOpacity = function(num1,num2){
  return 0.5+0.9*(num1/num2)
}

$.ajax({
  url: '/data-averages',
  type: 'get',
  dataType: 'json'
}).then(function(response){
  bikeData = response[0]
})

var addMarkers = function(){
  $.ajax({
    url: '/current-data',
    type: 'get',
    dataType: 'json'
  }).then(function(response){
    currentData = response
    var keys = Object.keys(currentData)
    keys.forEach(function(key){
      var station = currentData[key]
      var stationBikes = station.bikes
      var stationTotal = station.capacity
      var marker = new google.maps.Marker({
        position: {lat: station.lat, lng: station.lng},
        map: map,
        stationId: key,
        opacity: calculateOpacity(stationBikes,stationTotal)
      });
      marker.addListener('click',toggleInfo)
      markers.push(marker)
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
  console.log(this)
}

$(document).ready(function(){
  var $timeDropdown = $('#time-dropdown')
  var loadNewOpacity = function(){
    var time = $(this).val()
    var changeBaseData = (time==="current") ? currentData : bikeData;
    markers.forEach(function(marker){
      var station = changeBaseData[marker.stationId]
      if (station){
        var bikes = (time==="current") ? station.bikes : station.averageBikes[time]
        marker.setOpacity(calculateOpacity(bikes,station.capacity))        
      }
    })      
  }
  $timeDropdown.on('change', loadNewOpacity)
})
