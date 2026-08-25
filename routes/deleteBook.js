var express = require('express');
var router = express.Router();


var path = require('path');

var bodyParser = require('body-parser');


var request = require('request');

var async = require('async');

const fs = require('fs');

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



function requireAuth(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }

    return res.redirect("/login");
}

router.post("/deleteBook/:list&:title?", requireAuth, async (req, res, next) => {

    try {
        const userId = String(req.user._id);

        const listName = decodeURIComponent(req.params.list);
        const bookTitle = decodeURIComponent(req.params.title);

        const userBookList = await book_list.findOne({ userId });

        if (!userBookList) {
            return res.status(404).send("Book list not found.");
        }

        const currentList = userBookList.newList.find(
            list => list.list_name === listName
        );

        if (!currentList) {
            return res.status(404).send("List not found.");
        }

        const bookIndex = currentList.books.findIndex(
            book => book.book_name === bookTitle
        );

        if (bookIndex === -1) {
            return res.status(404).send("Book not found.");
        }

        currentList.books.splice(bookIndex, 1);

        await userBookList.save();

        return res.redirect(
            "/display_list/" + encodeURIComponent(listName)
        );

    } catch (error) {
        next(error);
    }
});

module.exports = router;


