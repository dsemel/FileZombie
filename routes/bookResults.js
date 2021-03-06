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


var tempArray = [];

router.get('/book_results', function(req,resp){

    resp.render('book_results', {books: bookList, bookSearchTerm: title_results,
        pageCount: pageCount,
        currentPage: currentPage});


});


router.all('/book_results/:encoded_id', function(req, response,err){



    var title_results = req.params.encoded_id;





    var count = 0;





    if(err){

        console.log(err);
    }


    request("https://www.googleapis.com/books/v1/volumes?q=" + title_results +"&maxResults=40&printType=books" ,
        function (error, resp, data) {
            if (!error) {

                var gb_data2 = JSON.parse(data);

                for(var i = 0; i< 40; i++){

                    tempArray.push(gb_data2.items[i]);
                    count++;



                }






                var bookArray = [];



                var bookList = [];







                if(err){

                    console.log(err);
                }







                const perPage = 10;
                let currentPage = 1;

                const totalBookList = tempArray.length;

                const pageCount = Math.ceil(totalBookList / perPage);

                if(req.query.page){

                    currentPage = parseInt(req.query.page, 10);
                }

                while(tempArray.length > 0){

                    bookArray.push(tempArray.splice(0,perPage))

                }

                bookList = bookArray[+currentPage - 1];

                const start = (currentPage - 1) * perPage;
                const end = currentPage * perPage;

                response.render('book_results', {books: bookList, bookSearchTerm: title_results,
                    pageCount: pageCount,
                    currentPage: currentPage});


            }




        });











});

module.exports = router;