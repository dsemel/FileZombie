var express = require('express');
var router = express.Router();


var path = require('path');

var bodyParser = require('body-parser');


var request = require('request');

var async = require('async');

const fs = require('fs');

var alert = require('alert');




var dotenv = require('dotenv');
dotenv.config();

var mongoose = require('mongoose');
mongoose.set("strictQuery", false);


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

// Route to move a book to another list
router.post('/moveBook/:list&:title?&:author', function(req, res) {

    const targetList = req.params.list; // The target list to move the book to
    const bookTitle = req.params.title; // The title of the book to move
    const author = req.params.author; // The author of the book to move





    const user =   book_list.findOne({"userId": req.userContext.userinfo.sub, newList:{ $elemMatch: {"books.book_name":bookTitle, "books.book_author": author}}});


    // Remove the book from the current list


    // save/push the book to the target list






});



module.exports = router;