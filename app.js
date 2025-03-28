//var createError = require('http-errors');
const express = require('express');

const app = express();


var path = require('path');

var alert = require('alert');



app.use(express.static(path.join(__dirname, 'public')));

app.set('trust proxy', 1); // ✅ trust Heroku proxy for secure cookies

var bodyParser = require('body-parser');

var createError = require('http-errors');


var logger = require('morgan');
var session = require("express-session");

var request = require('request');

var async = require('async');

const fs = require('fs');

var okta = require("@okta/okta-sdk-nodejs");


const MemoryStore = require('memorystore')(session);

var dotenv = require('dotenv');
dotenv.config();





var port = process.env.PORT || 3000;



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(
    require('express-session')({
        secret: process.env.APP_SECRET,
        resave: true,
        saveUninitialized: false,
        store: new MemoryStore({
            checkPeriod: 86400000
        }),
        cookie: {
            secure: true, // ✅ Forces HTTPS
            sameSite: 'none' // ✅ Required when using cookies across domains
        }
    })
);

app.use((req, res, next) => {
    console.log('Session at beginning of request:', req.session);
    next();
});



const { ExpressOIDC } = require('@okta/oidc-middleware');
const oidc = new ExpressOIDC({
    appBaseUrl: process.env.HOST_URL,
    issuer: `${process.env.OKTA_ORG_URL}/oauth2/default`,
    client_id: process.env.OKTA_CLIENT_ID,
    client_secret: process.env.OKTA_CLIENT_SECRET,
    redirect_uri: `${process.env.HOST_URL}/callback`,
    scope: 'openid profile',
    routes: {
        loginCallback: {
            path: '/callback'
        },
    }
});

app.use(oidc.router);


app.set('views', path.join(__dirname, '/views'));





app.set('view engine', 'ejs');
//app.set('view engine', 'hbs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));




var apiKey = process.env.api_key;

var tempArray = [];

// catch 404 and forward to error handler
//app.use(function(req, res, next) {
//  next(createError(404));
//});











const homePage = require('./routes/homePage.js');

app.use('/', homePage);


app.get('/authors', function(req,resp){

    resp.render('guidelinesAuthors.ejs');


});

app.get('/reviewGuidelines', function(req,resp){

    resp.render('reviewGuidelines.ejs');


});

app.get('/privacy', function(req,resp){

    resp.render('privacy2.ejs');


});

app.get('/contact', function(req,resp){

    resp.render('contact.ejs');


});

app.get('/terms', function(req,resp){

    resp.render('terms.ejs');


});

//app.get('/profile', oidc.ensureAuthenticated(), function(req,resp){

  //  const {userContext}  = req;

    //console.log(userContext.userinfo.sub);


    //resp.render('profile.ejs', {userContext, name: userContext.userinfo.given_name});


//});


const bookProfile = require('./routes/bookProfile.js');

app.all('/book_profile/:encoded_id', bookProfile);

var fileExpress = require('./routes/fileExpress.js');

app.all('/fileExpress/:encoded_id', fileExpress);


var bookResults = require('./routes/bookResults.js');

app.all('/book_results/:encoded_id', bookResults);



var redirectDisplayList = require('./routes/redirectDisplayList.js');

app.post('/redirectDisplayList/:encoded_id', redirectDisplayList);

var displayList = require('./routes/displayList.js');

app.post('/display_list/', displayList);

var remove_book_from_list = require('./routes/deleteBook.js');

app.post('/deleteBook/:encoded_id', remove_book_from_list);

var change_date_finished = require('./routes/changeDate.js');

app.post('/changeDate/:encoded_id', change_date_finished);

var view_User_Profile = require('./routes/profile.js');

app.get('/profile', view_User_Profile);



//var register = require('./routes/register');

//app.all('/register', register);

//app.use('/register', require('./routes/register'));












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