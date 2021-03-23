//var createError = require('http-errors');
var express = require('express');

var app = express();

var path = require('path');

app.use(express.static(path.join(__dirname, 'public')));



var bodyParser = require('body-parser');


var request = require('request');

var async = require('async');

const fs = require('fs');




var dotenv = require('dotenv');
dotenv.config();

var port = process.env.PORT || 3000;

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, '/views'));


app.set('view engine', 'ejs');


app.use(express.json());
app.use(express.urlencoded({ extended: false }));




var apiKey = process.env.api_key;

var tempArray = [];

// catch 404 and forward to error handler
//app.use(function(req, res, next) {
//  next(createError(404));
//});









var homePage = require('./routes/homePage.js');

app.use('/', homePage);

var bookProfile = require('./routes/bookProfile.js');

app.all('/book_profile/:encoded_id', bookProfile);


var bookResults = require('./routes/bookResults.js');

app.all('/book_results/:encoded_id', bookResults);

app.get('/terms', function(req,resp){

    resp.render('terms.ejs');


});

app.get('/authors', function(req,resp){

    resp.render('guidelinesAuthors.ejs');


});

app.get('/reviewGuidelines', function(req,resp){

    resp.render('reviewGuidelines.ejs');


});

app.get('/privacy', function(req,resp){

    resp.render('privacy2.ejs');


});



app.use(function(req,res){
    res.status(404).render('error.ejs');
});



app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).render('500Error.ejs')
});
















//});

// error handler
//app.use(function(err, req, res, next) {
  // set locals, only providing error in development
//  res.locals.message = err.message;
 // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
 // res.status(err.status || 500);
 // res.render('error');
// });

module.exports = app;



// listen for requests :)
var server = app.listen(port, function () {
    //var port = server.address().port;

    console.log('Your app is listening on port ' + port);
});