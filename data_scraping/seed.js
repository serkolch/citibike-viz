var glob = require('glob')
var fs = require('fs')

glob("data/*.json", function(er,files){
  var dataFiles = files

  var requiredData = dataFiles.map(function(file){
    return require('./'+file)
  })

  var MongoClient = require('mongodb').MongoClient;
  var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/sandbox';

  var db;

  MongoClient.connect(mongoUrl, function(err, database) {
    if (err) {
      console.log(err);
    }

    db = database;
    db.collection('bikes').remove({})

    var structure = {};
    requiredData[0].forEach(function(station){
      structure[station.id] = {
        latitude: station.latitude,
        longitude: station.longitude,
        stationName: station.stationName,
        capacity: station.totalDocks,
        averageBikes:{}
      }
    })

    var repeat = function (file,index){
      var time = dataFiles[index].split(/[\/.]+/)[1]
      var time = time.replace(":","-")
      file.forEach(function(station){
        structure[station.id].averageBikes[time] = station.availableBikes
      })
    }
    requiredData.forEach(repeat)

    db.collection('bikes').insert(structure)

    fs.writeFile('seed.json',JSON.stringify(structure))

    process.on('exit', db.close);
  });
})