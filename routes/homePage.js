var express = require('express');
var router = express.Router();


var path = require('path');

var bodyParser = require('body-parser');


var request = require('request');

var async = require('async');

const fs = require('fs');




var dotenv = require('dotenv');
dotenv.config();

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

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

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

    resp.redirect('/home');




});

router.get('/', function(req,resp){
    //resp.render('home', {books:"", nf_books:""});

    resp.render('home', {books:"", nf_books:"" });

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

                        try {
                            var info = JSON.parse(body);
                            if (info && info.results && info.results.books) {
                                const books = info.results.books;
                                next(null, books);
                            } else {
                                next(new Error('Invalid response structure for fiction books'));
                            }
                        } catch (parseError) {
                            console.error(parseError);
                            next(parseError);
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

                        try {
                            var nf_info = JSON.parse(body);
                            if (nf_info && nf_info.results && nf_info.results.books) {
                                const nf_books = nf_info.results.books;
                                next(null, nf_books);
                            } else {
                                next(new Error('Invalid response structure for nonfiction books'));
                            }
                        } catch (parseError) {
                            console.error(parseError);
                            next(parseError);
                        }


                    });


            }],

        function (err, results) {
            if (err) {
                return resp.status(500).send('Error fetching book data.');
            }
            const {userContext}  = req;


            resp.render('home', {userContext, books: results[0], nf_books: results[1]});

            if(userContext) {
                book_list.findOne({"userId": req.userContext.userinfo.sub}, function (err, doc) {

                    if (doc) {


                    } else {


                        var userBookList = new book_list({
                            userId: req.userContext.userinfo.sub,
                            first_name: req.userContext.userinfo.given_name,
                            last_name: req.userContext.userinfo.family_name,
                            newList:[{"list_name":"read"}, {"list_name":"currently reading"}, {"list_name":"want to read"}]



                        });


                        userBookList.save(function (err) {


                            if (err) {
                                console.log(err);
                            }




                        });


                    }
                })
            }



        });
});


module.exports = router;


