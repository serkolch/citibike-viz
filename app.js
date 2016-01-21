var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request')

// Configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/bower_components'));
app.use(express.static(__dirname + '/semantic'));
app.set('view engine', 'ejs')

// db
var db;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/sandbox';
MongoClient.connect(mongoUrl, function(err, database) {
  if (err) { throw err; }
  db = database;
  process.on('exit', db.close);
});

// Routes
app.get('/', function(req, res){
  res.render('index',{key: process.env.GOOGLE_KEY});
})

app.get('/current', function(req,res){
  request('http://www.citibikenyc.com/stations/json',function(error,response,body){
    var parsedData = JSON.parse(body)
    var stations = parsedData.stationBeanList.map(function(station){
      return {stationId: station.id, lat: station.latitude, lng: station.longitude, bikes: station.availableBikes, capacity: station.totalDockqs}
    })
    res.json(stations)
  })
})

app.get('/data',function(req,res){
  //send mongo data to front end
})

app.listen(process.env.PORT || 3000);