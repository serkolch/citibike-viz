var map;
var markers = [];
var bikeData
var currentData
var bike = 'images/bike.png';
var keys = []

var calculateOpacity = function(num1,num2){
  return 0.1+0.98*(num1/num2)
}

var determineBaseData = function(time){
  return (time==='current') ? currentData : bikeData
}

var determineStationBikes = function(data,time,id){
  return (time==='current') ? data[id].bikes : data[id].averageBikes[time]
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
    var infoWindow = new google.maps.InfoWindow({
      content: '<button class="start-station ui inverted blue button small">Start Dock</button>'+
        '<button class="end-station ui inverted blue button small">Destination</button>'
    })

    google.maps.event.addListener(infoWindow,'domready',function(){
      $('.start-station').off();
      $('.end-station').off();
      var time = $('#time-dropdown').val()
      var stationName = bikeData[infoWindow.stationId].stationName
      var stationBikes = determineStationBikes(determineBaseData(time),time,infoWindow.stationId)
      var stationDocks = bikeData[infoWindow.stationId].capacity - stationBikes
      $('.start-station').on('click',function(){
        $('#start-station-name').text(stationName)
        $('#start-station-bikes').text('Bikes Available: '+stationBikes)
        $('#start-station-bikes').attr('station',infoWindow.stationId)
      })
      $('.end-station').on('click',function(){
        $('#end-station-name').text(stationName)
        $('#end-station-docks').text('Docks Available: '+stationDocks)
        $('#end-station-docks').attr('station',infoWindow.stationId)
      })
    })

    Object.keys(currentData).forEach(function(key){
      if (Object.keys(bikeData).indexOf(key)>=0){
        keys.push(key)
      }
    })

    keys.forEach(function(key){
      var station = currentData[key]
      var stationBikes = station.bikes
      var stationTotal = station.capacity

      var marker = new google.maps.Marker({
        position: {lat: station.lat, lng: station.lng},
        map: map,
        stationId: key,
        icon: bike,
        opacity: calculateOpacity(stationBikes,stationTotal)
      });
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

  var setMarkerOpacity = function(time){
    var baseData = determineBaseData(time);
    markers.forEach(function(marker){
      var station = baseData[marker.stationId]
      if (station){
        var bikes = (time==="current") ? station.bikes : station.averageBikes[time]
        marker.setOpacity(calculateOpacity(bikes,station.capacity))     
      }
    })  
  }

  var changeBikesAndDocks = function(time){
    var startStationId = $startStationBikes.attr('station')
    var endStationId = $endStationDocks.attr('station')
    var baseData = determineBaseData(time)
    if (startStationId){
      var bikes = determineStationBikes(baseData,time,startStationId)
      $startStationBikes.text('Bikes Available: '+bikes)
    }
    if (endStationId){
      var docks = bikeData[endStationId].capacity - determineStationBikes(baseData,time,endStationId)
      $endStationDocks.text('Docks Available: '+docks)
    }
  }

  var timeChange = function(){
    var time = $(this).val()
    setMarkerOpacity(time);
    changeBikesAndDocks(time);
  }

  $timeDropdown.on('change', timeChange)

  var $playButton = $('#play-button');
  var $pauseButton = $('#pause-button');
  var loopTimes = function(){

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
      var time = $timeDropdown.val()
      setMarkerOpacity(time)
      changeBikesAndDocks(time)
    },1000)

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
