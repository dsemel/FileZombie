var express = require('express');
var router = express.Router();


var path = require('path');

var bodyParser = require('body-parser');


var request = require('request');

var async = require('async');

const fs = require('fs');

var alert = require('alert');

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

db.on('error', console.error.bind(console, 'MongoDB connection error:'));



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


router.get('/book_profile', function(req,resp){

    resp.render('book_profile', {book_description:"", book_image:"",smallBook_image:"", book_title: "", book_author: "",
        book_isbnTen:"", book_isbnThirteen:"", book_pageCount:"", book_printType:"", read:" ", currentlyReading:" ", wantToRead:"", addList:"", i: 3});


});

var counter = 0;

router.all('/book_profile/:title&:author?', function(req, response,err){



    counter = counter + 1;
    var title = req.params.title;
    var author = req.params.author;

    var a = [];
    const {userContext}  = req;
    if(userContext) {

        book_list.findOne({"userId": req.userContext.userinfo.sub}, function (err, doc) {
            if (err) {
                console.log(err)
            }

            if(doc.newList.length>3) {

                a = doc.newList;

            }

        });

    }


    if(author === undefined){

        author = " ";
        console.log('no author');

    }


        var url = "https://www.googleapis.com/books/v1/volumes?q=intitle:" + title + "?=inauthor:" + author + "&?printType=books"

        console.log(author);








    if(err){



        console.log(err);
    }


    request(url,
        function (error, resp, data) {
            if (error) {

                console.log(error);

            }


            else {
                var gb_data = JSON.parse(data);


                const gb_description = gb_data.items[0].volumeInfo.description === undefined ? " " : gb_data.items[0].volumeInfo.description;
                const gb_image = gb_data.items[0].volumeInfo.imageLinks ? gb_data.items[0].volumeInfo.imageLinks.thumbnail : " ";
                const gb_smallImage = gb_data.items[0].volumeInfo.imageLinks ? gb_data.items[0].volumeInfo.imageLinks.smallThumbnail : " ";
                const gb_title = gb_data.items[0].volumeInfo.title=== undefined ? " " : gb_data.items[0].volumeInfo.title;
                const gb_author = gb_data.items[0].volumeInfo.authors=== undefined ? " " : gb_data.items[0].volumeInfo.authors;
                const gb_isbn13 = gb_data.items[0].volumeInfo.industryIdentifiers ? gb_data.items[0].volumeInfo.industryIdentifiers[0].identifier : " ";
                const gb_isbn10 = gb_data.items[0].volumeInfo.industryIdentifiers ? gb_data.items[0].volumeInfo.industryIdentifiers[1].identifier : " ";
                const gb_pageCount = gb_data.items[0].volumeInfo.pageCount=== undefined ? " " : gb_data.items[0].volumeInfo.pageCount;
                const gb_printType = gb_data.items[0].volumeInfo.printType=== undefined ? " " : gb_data.items[0].volumeInfo.printType;



                const {userContext}  = req;

                console.log('counter:' + counter);

                response.render('book_profile',{userContext, book_description: gb_description, book_image: gb_image, smallBook_image:gb_smallImage,
                    book_title: gb_title, book_author: gb_author, book_isbnTen: gb_isbn10, book_isbnThirteen: gb_isbn13,
                    book_pageCount: gb_pageCount, book_printType: gb_printType, read: "read", currentlyReading:"currentlyReading", wantToRead:"wantToRead", addList:a });









            }




        });
});








module.exports = router;