var map;
var markers = [];
var bikeData
var currentData
var bike = 'images/bike.png';
var keys = []
var time = 'current'
var originStationId
var destinationStationId

// Calculate marker opacity based on number of bikes in station
var calculateOpacity = function(num1,num2){
  return 0.08+0.92*(num1/num2)
}

// Calculate and append recommendation
var calculateRecommendation = function(id1,id2){
  var baseData = determineBaseData(time)
  var bikes = determineStationBikes(baseData,time,id1)
  var docks = bikeData[id2].capacity - determineStationBikes(baseData,time,id2)
  if (bikes>15 && docks>15){
    var message = 'Recommended'
    var style = {'background-color':'green','color':'white'}
  } else if (bikes<15 && docks<15){
    var message = 'Not Recommended'
    var style = {'background-color':'red','color':'white'}
  } else {
    var message = 'Consider New Route'
    var style = {'background-color':'yellow','color':'gray'}
  }
  $('#recommendation').text(message)
  $('#recommendation').css(style)
}

// Calculate and append distance/duration
var calculateTripData = function(){
  originStationId = $('#start-station-bikes').attr('station')
  var originStation = bikeData[originStationId]
  var origin = new google.maps.LatLng(originStation.latitude,originStation.longitude);
  destinationStationId = $('#end-station-docks').attr('station')
  var destinationStation = bikeData[destinationStationId]
  var destination = new google.maps.LatLng(destinationStation.latitude,destinationStation.longitude)

  var service = new google.maps.DistanceMatrixService();
  service.getDistanceMatrix({
    origins: [origin],
    destinations: [destination],
    travelMode: google.maps.TravelMode.BICYCLING
  }, function(response,status){
    var distance = response.rows[0].elements[0].distance.text
    var duration = response.rows[0].elements[0].duration.text
    $('#trip-distance').text('Distance: '+distance)
    $('#trip-duration').text('Duration: '+duration)
  })
}

// Set base data to either historical bike data or current data based on input time
var determineBaseData = function(time){
  return (time==='current') ? currentData : bikeData
}

// Find number of bikes at a station
var determineStationBikes = function(data,time,id){
  return (time==='current') ? data[id].bikes : data[id].averageBikes[time]
}

// Load historical data
$.ajax({
  url: '/data-averages',
  type: 'get',
  dataType: 'json'
}).then(function(response){
  bikeData = response[0]
})

// All encompassing markers function
var addMarkers = function(){
  // Load current data from Citibike API (routed through server for security reasons)
  $.ajax({
    url: '/current-data',
    type: 'get',
    dataType: 'json'
  }).then(function(response){
    currentData = response

    // Create an info window that loads on each marker with two buttons
    var infoWindow = new google.maps.InfoWindow({
      content: '<p id="station-name"></p>'+'<br>'+'<button class="start-station ui inverted blue button small">Start Dock</button>'+'<br>'+
        '<button class="end-station ui inverted blue button small">Destination</button>'
    })

    // Add an event listener on the infoWindow when the DOM is loaded
    google.maps.event.addListener(infoWindow,'domready',function(){
      // Remove existing listeners (prevent duplicate functionality)
      $('.start-station').off();
      $('.end-station').off();

      time = $('#time-dropdown').val()
      var stationName = bikeData[infoWindow.stationId].stationName
      var stationBikes = determineStationBikes(determineBaseData(time),time,infoWindow.stationId)
      var stationDocks = bikeData[infoWindow.stationId].capacity - stationBikes

      // Populate tables with information about stations, add station attribute to reference later
      $('.start-station').on('click',function(){
        $('#start-station-name').text(stationName)
        $('#start-station-bikes').text('Bikes Available: '+stationBikes)
        $('#start-station-bikes').attr('station',infoWindow.stationId)
        if ($('#end-station-docks').attr('station')){
          calculateTripData();
          calculateRecommendation(originStationId,destinationStationId)
        }
      })
      $('.end-station').on('click',function(){
        $('#end-station-name').text(stationName)
        $('#end-station-docks').text('Docks Available: '+stationDocks)
        $('#end-station-docks').attr('station',infoWindow.stationId)
        if ($('#start-station-bikes').attr('station')){
          calculateTripData();
          calculateRecommendation(originStationId,destinationStationId)
        }        
      })
    })

    //Create an array of keys for stations in both current data and bike data
    console.log(1,currentData)
    console.log(2, bikeData)
    Object.keys(currentData).forEach(function(key){
      if (Object.keys(bikeData).indexOf(key)>=0){
        keys.push(key)
      }
    })

    keys.forEach(function(key){
      var station = currentData[key]
      var stationBikes = station.bikes
      var stationTotal = station.capacity

      // Create a new marker at the correct position and a calculated opacity for each station
      var marker = new google.maps.Marker({
        position: {lat: station.lat, lng: station.lng},
        map: map,
        stationId: key,
        icon: bike,
        opacity: calculateOpacity(stationBikes,stationTotal)
      });

      // Pop open the infoWindow on click, and re-assign the infoWindow stationId
      marker.addListener('click',function(){
        infoWindow.open(map,marker)
        infoWindow.stationId = marker.stationId
      })
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

$(document).ready(function(){
  var $timeDropdown = $('#time-dropdown')
  
  var $startStationBikes = $('#start-station-bikes')
  var $endStationDocks = $('#end-station-docks')

  // Set the opacity on the markers
  var setMarkerOpacity = function(time){
    var baseData = determineBaseData(time);
    markers.forEach(function(marker){
      var station = baseData[marker.stationId]
      if (station){
        var bikes = determineStationBikes(baseData,time,marker.stationId)
        marker.setOpacity(calculateOpacity(bikes,station.capacity))     
      }
    })  
  }

  // Change the values of bikes and docks in the table
  var changeBikesAndDocks = function(time){
    var startStationId = $startStationBikes.attr('station')
    var endStationId = $endStationDocks.attr('station')
    var baseData = determineBaseData(time)
    // Change bikes if startStationId is defined
    if (startStationId){
      var bikes = determineStationBikes(baseData,time,startStationId)
      $startStationBikes.text('Bikes Available: '+bikes)
    }
    // Change docks if endStationId is defined
    if (endStationId){
      var docks = bikeData[endStationId].capacity - determineStationBikes(baseData,time,endStationId)
      $endStationDocks.text('Docks Available: '+docks)
    }
  }

  var timeChange = function(){
    time = $(this).val()
    setMarkerOpacity(time);
    changeBikesAndDocks(time);
  }
  $timeDropdown.on('change', timeChange)

  var $playButton = $('#play-button');
  var $pauseButton = $('#pause-button');
  
  var loopTimes = function(){
    // Elements of defined times, excluding current
    var $options = $('option').slice(1,$('option').length)
    var currentIndex

    $.each($options, function(index,option){
      if (option===$('#time-dropdown option:selected')[0]){
        currentIndex = index
      }
    })

    var loopInterval = window.setInterval(function(){
      if (currentIndex === undefined || currentIndex ===$options.length-1){
        currentIndex = -1;
      }
      currentIndex++;
      $timeDropdown.selected = false;
      $options[currentIndex].selected = true;
      time = $timeDropdown.val()
      setMarkerOpacity(time)
      changeBikesAndDocks(time)
      if (originStationId && destinationStationId) {
        calculateRecommendation(originStationId,destinationStationId)
      }
    },100)

    $playButton.addClass('disabled')
    $pauseButton.removeClass('disabled');
    $pauseButton.on('click', function(){
      clearInterval(loopInterval)
      $pauseButton.off()
      $pauseButton.addClass('disabled')
      $playButton.removeClass('disabled')
    })

  }
  $playButton.on('click',loopTimes)

  $('#help').on('click',function(){
    $('.ui.modal').modal('show');
  })

})
