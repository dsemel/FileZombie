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

async function renderList(req, response, next, listName) {





    console.log('listName is ' + listName);
   // var listName = req.params.encoded_id;

    const movedBook = String(req.query.moved || "");
    const destination = String(req.query.destination || "");

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

            const lists = user.newList.map(list => list.list_name);

            console.log("User's lists:", lists);

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
                totalPages,
                lists
            };
        } catch (error) {
            throw new Error(`Error paginating books: ${error.message}`);
        }
    }



    paginateBooks()
        .then(({ paginatedBooks, totalPages, lists }) => {

            response.render('display_list', {
                list_books: paginatedBooks,
                listName: listName,
                currentPage: currentPage,
                totalPages: totalPages,
                message: paginatedBooks.length === 0
                    ? "No books saved to " + listName + " yet!"
                    : "Books saved to " + listName,
                userContext: {
                    lists: lists
                },
                movedBook: movedBook,
                destination: destination
            });

        })
        .catch(error => {
            console.error('Error:', error.message);
            next(error);
        });


}

router.post("/display_list/", requireAuth, function (req, res, next) {
    const listName = req.body.list;

    if (!listName || listName === "Please select ..." || listName === "More ...") {
        return res.redirect("/profile");
    }

    return renderList(req, res, next, listName);
});

router.get("/display_list/:listName", requireAuth, function (req, res, next) {
    const listName = decodeURIComponent(req.params.listName);
    return renderList(req, res, next, listName);
});
module.exports = router;