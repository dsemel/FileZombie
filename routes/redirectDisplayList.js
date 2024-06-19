var express = require('express');
var router = express.Router();


var path = require('path');

var bodyParser = require('body-parser');


var request = require('request');

var redirectCounter = 0;

router.post('/redirectDisplayList/:encoded_id', function(req,resp,err){

    redirectCounter = redirectCounter + 1;
    var listName = req.params.encoded_id;

    console.log(listName);

    if(err){
        console.log(err);
    }
    console.log('redirectCounter:' + redirectCounter);
    resp.redirect('/display_list/' + listName);

});


module.exports = router;