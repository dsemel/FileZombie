var mongoose = require('mongoose');
var Schema = mongoose.Schema;



const bookList_schema =  new mongoose.Schema({
    name:{type: String, required: true},
    book_name:{type: String, required: true},
    book_author:{type: String, required: true},
    date_added:{ type : Date, default: Date.now },
    date_finished:{ type : Date, default: Date.now }
});



var book_listSchema = new mongoose.Schema({

    userId:{type: String, required: true},
    first_name: { type: String, required: true},
    last_name:{ type: String, required: true},
    newList: [{

             list_name: String,
             books:
        [{
            list_name: String,
            book_name: {type: String, required: true},
            book_author: {type: String, required: true},
            date_added: {type: Date, default: Date.now},
            date_finished: {type: Date, default: Date.now},
            book_image:{type: String, required: true}


        }]}],


        });

var book_list = mongoose.model('book_list', book_listSchema);

module.exports = book_list;