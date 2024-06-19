var express = require('express');
var router = express.Router();


var path = require('path');

var bodyParser = require('body-parser');


var request = require('request');

var async = require('async');

const fs = require('fs');

var mongoose = require('mongoose');

var mongoLink = process.env.MONGO_DB_ATLAS;

var promise = mongoose.connect(mongoLink, {

    // useMongoClient: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.Promise = global.Promise;

var db = mongoose.connection;

var book_list = require('./list.js');
const {list} = require("pm2");
const {get} = require("mongoose");

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var port = process.env.PORT || 3000;

var app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.use(express.static(path.join(__dirname, 'public')));


app.set('views', path.join(__dirname, '/views'));

app.set('routes', path.join(__dirname, '/routes'));

app.set('view engine', 'ejs');


app.use(express.json());
app.use(express.urlencoded({ extended: false }));




router.get('/profile', async function(req, res) {
    const {userContext}  = req;

    try {
        const doc = await book_list.findOne({"userId": req.userContext.userinfo.sub});

        if (doc && doc.newList && doc.newList.length > 3) {
            res.render('profile', { addList: doc.newList, userContext, name: userContext.userinfo.given_name });
        } else {
            res.render('profile', { addList: 'No books added yet!', userContext, name: userContext.userinfo.given_name });
        }
    } catch (error) {
        console.error('Error retrieving profile data:', error);
        res.status(500).send('Error retrieving profile data.');
    }
});

module.exports = router;