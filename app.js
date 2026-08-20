//var createError = require('http-errors');
const express = require('express');

const app = express();

var dotenv = require('dotenv');
dotenv.config();


var path = require('path');

var alert = require('alert');



app.use(express.static(path.join(__dirname, 'public')));

app.set('trust proxy', 1); // ✅ trust Heroku proxy for secure cookies

var bodyParser = require('body-parser');

var createError = require('http-errors');


var logger = require('morgan');


var request = require('request');

var async = require('async');

const fs = require('fs');












var port = process.env.PORT || 3000;



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
});


app.use(express.static(path.join(__dirname, 'public')));




const session = require("express-session");
const MongoStore = require("connect-mongo").default;


app.use(
    session({
        name: "fz.sid",
        secret: process.env.SESSION_SECRET, // keep compatibility
        resave: false,
        saveUninitialized: false,
        rolling: true,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_DB_ATLAS,
            ttl: 60 * 60 * 24 * 14, // 14 days
        }),
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // only true in prod
            sameSite: "lax", // ✅ now login is on same site
            maxAge: 1000 * 60 * 60 * 24 * 14,
        },
    })
);

const passport = require("./auth/passport"); // adjust path if your file is elsewhere
app.use(passport.initialize());
app.use(passport.session());

const authRoutes = require("./routes/auth");
app.use("/", authRoutes);

app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.isAuthenticated = req.isAuthenticated ? req.isAuthenticated() : false;
    next();
});










app.set('views', path.join(__dirname, '/views'));





app.set('view engine', 'ejs');
//app.set('view engine', 'hbs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


















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





const bookProfile = require("./routes/bookProfile.js");
app.use("/book_profile", bookProfile);

const fileExpress = require("./routes/fileExpress.js");
app.use("/fileExpress", fileExpress);




const bookResults = require("./routes/bookResults.js");
app.use("/book_results", bookResults);


const apiBooks = require("./routes/apiBooks");
app.use("/api/books", apiBooks);




var displayList = require('./routes/displayList.js');

app.post('/display_list/', displayList);

var remove_book_from_list = require('./routes/deleteBook.js');

app.post('/deleteBook/:encoded_id', remove_book_from_list);

var change_date_finished = require('./routes/changeDate.js');

app.post('/changeDate/:encoded_id', change_date_finished);

const view_User_Profile = require("./routes/profile.js");
app.use("/", view_User_Profile);


















app.use(function(req,res){
    res.status(404).render('error.ejs');
});



app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).render('500Error.ejs')
});

















module.exports = app;





var server = app.listen(port, function () {


    console.log('Your app is listening on port ' + port);
});