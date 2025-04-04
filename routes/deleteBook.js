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



router.post('/deleteBook/:list&:title?', async (req, res) => {

        const list = req.params.list;
        const title = req.params.title;
        const {userContext}  = req;

        try {
            const user = await  book_list.findOne({"userId": req.userContext.userinfo.sub}, {newList:{$elemMatch:{listName: list}}});
            if (!user) {
                throw new Error('User not found');
            }

            console.log("user is" + user);
            const bookList = user.newList[0].books;

            console.log("This is bookList" + bookList);
            if (!bookList) {
                throw new Error('Book list not found');
            }

            const bookIndex = bookList.findIndex(bookList => bookList.book_name === title);

            if (bookIndex === -1) {
                return res.status(404).json({ error: 'Book not found' });
            }

            bookList.splice(bookIndex, 1);  // remove the book from the list

            // Save the updated user
            await user.save();

            return res.json({ message: 'Book deleted successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.redirect('/home');

});

module.exports = router;


