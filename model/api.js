var request = require('request');
var MongoClient = require('mongodb').MongoClient;
var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/sandbox';

module.exports = {

  getDBBikes: function(req,res,next){
    
    MongoClient.connect(mongoUrl,function(err,db){
      
      db.collection('bikes')
        .find()
        .toArray(function(err,data){
          if (err) throw err;
          res.dbBikes = data;
          next();  
        })

    })
  
  },

  getCurrentBikes: function(req,res,next){

    request('http://www.citibikenyc.com/stations/json',function(error,response,body){

      var parsedData = JSON.parse(body)
      res.currentBikes = {}

      parsedData.stationBeanList.forEach(function(station){
        res.currentBikes[station.id]={lat: station.latitude, lng: station.longitude, bikes: station.availableBikes, capacity: station.totalDocks}
      })
      next();
      
    })
  }

}