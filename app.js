var times       = require('./model/time');
var bodyParser  = require('body-parser');
var express     = require('express');
var cors        = require('cors');
var app         = express();

// Configuration
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/bower_components'));
app.use(express.static(__dirname + '/semantic'));
app.set('view engine', 'ejs')

var timesDash = times.map(function(time){
  time = time.replace(":","-");
  time = (time.length===6) ? '0'+time : time;
  console.log(time);
  return time
})

// Routes
var apiRouter = require('./routes/api');
app.use('/api',apiRouter);

app.get('/', function(req, res){
  res.render('index',{key: process.env.GOOGLE_KEY,values: timesDash,times:times});
})

app.get('*', function(req,res){
  res.redirect('/');
})
app.listen(process.env.PORT || 3000);