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










    if(err){

        console.log(err);
    }

    const perPage = 10;
    let currentPage = 1;

    if (req.query.page) {
        currentPage = parseInt(req.query.page, 10);
    }
    const startIndex = (currentPage - 1) * perPage;



    request("https://www.googleapis.com/books/v1/volumes?q=" + title_results +"&startIndex="+ startIndex + "&maxResults=" + perPage + "&printType=books" ,
        function (error, resp, data) {

            if (error) {
                console.log(error);
                return response.status(500).send('Error fetching data from Google Books API');
            }





            let gb_data2;
            try {
                gb_data2 = JSON.parse(data);
            } catch (e) {
                console.log('Error parsing JSON:', e);
                return resp.status(500).send('Error parsing data from Google Books API');
            }

            if (!gb_data2 || !gb_data2.items) {
                return response.render('book_results', {
                    userContext: req.userContext,
                    books: [],
                    bookSearchTerm: title_results,
                    pageCount: 0,
                    currentPage: currentPage
                });
            }

            const totalBookList = gb_data2.totalItems || 0;
            const pageCount = Math.ceil(totalBookList / perPage);

            console.log('pageCount:' + " "  + pageCount);

            if (currentPage > pageCount) {
                return resp.redirect(`/book_results/${title_results}&page=${pageCount}`);
            }


            var bookList = gb_data2.items;



                  //  const {userContext} = req;


                    response.render('book_results', {
                        userContext: req.userContext, books: bookList, bookSearchTerm: title_results,
                        pageCount: pageCount,
                        currentPage: currentPage
                    });







        });











});

module.exports = router;