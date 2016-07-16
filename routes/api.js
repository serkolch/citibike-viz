var router = require('express').Router();
var request = require('request');
var api = require('../model/api');

router.get('/citibike',api.getCurrentBikes, function(req,res){
  res.json(res.currentBikes)
})

router.get('/db',api.getDBBikes,function(req,res){
  res.json(res.dbBikes)
})

module.exports = router;