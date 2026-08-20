var express = require('express');
var router = express.Router();


var path = require('path');

var bodyParser = require('body-parser');


var request = require('request');

var async = require('async');

const fs = require('fs');





var book_list = require('./list.js');
const {list} = require("pm2");
const {get} = require("mongoose");





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
    if (req.isAuthenticated && req.isAuthenticated()) return next();
    return res.redirect("/login");
}

router.post("/display_list/", requireAuth, function (req, response, next) {
    const listName = req.body.list;

    if (!listName || listName === "Please select ..." || listName === "More ...") {
        return response.redirect("/profile");
    }




    console.log('listName is ' + listName);
   // var listName = req.params.encoded_id;

    var tempArray = [];

    var newBookList = [];

    let perPage = 10;
    let currentPage = 1;


    if(req.query.page){

        currentPage = parseInt(req.query.page, 10);
    }

    console.log("the currentPage is  " + currentPage);

    let query = {};








    const skip = 10 * (currentPage - 1);
    const limit = perPage;

    console.log("skip is" + skip + "" + "current page is" + currentPage + "limit is" + limit);
    console.log("listName is" + listName);




    // Assuming you have already connected to the MongoDB database and imported the User model

// Function to paginate books in a specific list
    async function paginateBooks() {
        try {
            const userId = String(req.user._id);
            const user = await book_list.findOne({ userId });
            if (!user) {
                throw new Error('User not found');
            }

            // Use find to get the sublist that matches the listName

            // Use find to get the sublist that matches the list_name
            const targetList = user.newList.find(list => list.list_name === listName);
            if (!targetList) {
                throw new Error(`Book list named '${listName}' not found`);
            }


            const bookList = targetList.books;

            if (!bookList) {
                throw new Error('Book list not found');
            }


            const sortedBookList = [...bookList].sort((a,b) => b.date_finished - a.date_finished);

            const startIndex = (currentPage - 1) * perPage;
            const endIndex = startIndex + perPage;

            const paginatedBooks = sortedBookList.slice(startIndex, endIndex);

            // The totalPages calculation should be based on the total number of books before slicing
            const totalPages = Math.ceil(sortedBookList.length / perPage);

            return {
                paginatedBooks,
                totalPages
            };
        } catch (error) {
            throw new Error(`Error paginating books: ${error.message}`);
        }
    }



    paginateBooks()
        .then(({ paginatedBooks, totalPages }) => { // Destructure the resolved object

            if (paginatedBooks.length === 0) {
                response.render('display_list', {

                    list_books: paginatedBooks,
                    listName: listName,
                    currentPage: currentPage,
                    totalPages: 0, // Correctly display totalPages even if it's 0
                    message: "No books saved to " + listName + " yet!"
                });
            } else {
                response.render('display_list', {

                    list_books: paginatedBooks,
                    listName: listName,
                    currentPage: currentPage,
                    totalPages: totalPages, // Ensure totalPages is used from the resolved object
                    message: "Books saved to " + listName
                });
            }
        })
        .catch(error => {
            console.error('Error:', error.message);
            // Consider rendering an error page or message here as well
        });


});
module.exports = router;