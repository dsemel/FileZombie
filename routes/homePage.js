var express = require('express');
var router = express.Router();


var path = require('path');

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


/* GET home page. */

router.get('/', function(req,resp){

    resp.render('/', {books:"", nf_books:""});



});

router.get('/', function(req,resp){

    resp.redirect('/home');
});





router.get('/home', function(req,resp) {

    async.parallel([
            function (next) {
                request("https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=" + apiKey,
                    function (error, response, body) {
                        if (error) {

                            console.log(error);
                            next(error);
                        }

                        else {
                            var info = JSON.parse(body);
                            const books = info.results.books;
                            return next(null, books);


                        }
                    });
            },


            function (next) {

                request("https://api.nytimes.com/svc/books/v3/lists/current/hardcover-nonfiction.json?api-key=" + apiKey,
                    function (error, response, body) {
                        if (error) {

                            console.log(error);
                            next(error);
                        }

                        else {
                            var nf_info = JSON.parse(body);

                            const nf_books = nf_info.results.books;

                            return next(null, nf_books);


                        }


                    });


            }],

        function (err, results) {

            resp.render('home', {books: results[0], nf_books: results[1]});



        });
});
module.exports = router;


