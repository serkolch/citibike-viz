var fs = require('fs')
var glob = require('glob')

glob("data/*.json", function(er,files){
  var dataFiles = files
  console.log
  // var dataFiles = ['./data/02:00PM.json','./data/02:15PM.json','./data/02:30PM.json','./data/02:45PM.json']

  var requiredData = dataFiles.map(function(file){
    return require('./'+file)
  })

  var MongoClient = require('mongodb').MongoClient;
  var mongoUrl = 'mongodb://localhost:27017/sandbox';

  var db;

  MongoClient.connect(mongoUrl, function(err, database) {
    if (err) {
      console.log(err);
    }

    db = database;
    db.collection('bikes').remove({})

    var structure = [];
    requiredData[0].forEach(function(station){
      structure.push({
        latitude: station.latitude,
        longitude: station.longitude,
        stationName: station.stationName,
        capacity: station.totalDocks,
        stationId: station.id,
        saturation:[]
      })
    })

    db.collection('bikes').insert(structure)

    var repeat = function (file,index){
      var time = dataFiles[index].split(/[\/.]+/)[1]
      file.forEach(function(station){
        db.collection('bikes').update({stationId: station.id},{$push: {saturation: {hour: time, bikes: station.availableBikes}}})
      })
    }
    requiredData.forEach(repeat)

    process.on('exit', db.close);
  });
})