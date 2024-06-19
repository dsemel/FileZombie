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

router.post('/changeDate/:list&:title?', async (req, res) => {
    var list = req.params.list;
    var title = req.params.title;
    var newDate = req.body.newDate;

    const {userContext}  = req;
    // Convert the date string to a UTC date object
    const utcDate = new Date(newDate);
    // Convert the UTC date to a string in ISO format to ensure consistency
    const isoDate = utcDate.toLocaleDateString();

    //write code to so date is correct time zone and display in format month/day/year

   // const correctDate = new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000);
   // const date = correctDate.toISOString().split('T')[0];
   // console.log("This is the selected date:" + date);

    //use moment.js to display date correctly
    const moment = require('moment-timezone');
    const date = moment.utc(newDate).format('MM/DD/YYYY');
    console.log("This is the selected date:" + date);







        try {
            const result = await book_list.updateOne(
                { "userId": req.userContext.userinfo.sub, "newList.list_name": list, "newList.books.book_name": title },
                { $set: { "newList.$[list].books.$[book].date_finished": date} },
                {
                    arrayFilters: [
                        { "list.list_name": list },
                        { "book.book_name": title }
                    ]
                }
            );

            if(result.nModified === 0) {
                return res.status(404).send('Book or List not found');
            }

            res.json({ success: true });
        } catch (error) {
            console.error('Error updating date finished:', error);
            res.status(500).json({ success: false, message: 'Error updating date finished' });
        }


    });







module.exports = router;