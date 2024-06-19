var express = require('express');
var router = express.Router();


var path = require('path');

var bodyParser = require('body-parser');


var request = require('request');

var async = require('async');

const fs = require('fs');

var alert = require('alert');




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
const {list} = require("pm2");

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

/*
router.get('/fileExpress/:title&author?', function(req, resp){

    resp.render('/home');
    //resp.status(204).send();
});
*/

router.post('/fileExpress/:title&:author?', function(req, resp){

     console.log(req.body.New);

    if(!req.body.New && !req.body.moreList){

        var list_name = req.body.list;


    }

    else if(!req.body.New && !req.body.list){
        var list_name = req.body.moreList;
   }

    else{
        var list_name = req.body.New;
    }

    var title = req.params.title;
    var author = req.params.author;

    var image = req.body.image;


    const addToList = {};



    addToList[list_name] = [{book_name: title, book_author:author, date_added: new Date()}];

    var bookShelf = JSON.stringify(req.body.list);



      book_list.findOne({"userId": req.userContext.userinfo.sub, newList:{ $elemMatch: {"list_name": list_name, "books.book_name":title, "books.book_author": author}}}, function (err, doc) {

            if(doc){


                        console.log("book already added to list")
                        console.log(doc);



            }

            else{


                book_list.findOneAndUpdate({
                        userId: req.userContext.userinfo.sub,
                        newList: {
                            $elemMatch: {
                                list_name: list_name
                            }
                        }
                    },
                    {
                        $push: {
                            "newList.$.books": {
                                list_name: list_name,
                                book_name: title,
                                book_author: author,
                                date_added: new Date(),
                                book_image: image
                            }
                        }
                    }, function(err, doc){

                    if(doc){



                        console.log("book added to existing list");

                    }

                    else{
                        book_list.findOneAndUpdate({"userId": req.userContext.userinfo.sub},{ $push:{newList:{"list_name": list_name, books:{list_name: list_name,book_name: title, book_author:author, date_added: new Date(),book_image: image}}}},


                            function (error, success) {
                                if (error) {
                                   // console.log(error);
                                } else {
                                   // console.log(success);
                                }
                            });

                    }

                })



                //console.log("book saved to list")




                  }
        })






});



module.exports = router;