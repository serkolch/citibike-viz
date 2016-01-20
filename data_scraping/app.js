var request = require('request');
var fs = require('fs')

var bikeData = function(){
  // var end = Date.now()+120000
  var oneMinute = 60000
  var interval = setInterval(function () {
    request('https://www.citibikenyc.com/stations/json',function(error,response,body){
      var data = JSON.parse(response.body)
      var splitDatetime = data.executionTime.split(" ")
      var fileName = 'data/'+splitDatetime[1]+splitDatetime[2]+'.json'
      fs.writeFile(fileName,JSON.stringify(data.stationBeanList))
    })
  }, 15*oneMinute)
}

bikeData()