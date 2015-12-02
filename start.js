'use strict';
var express = require('express');
var app = express();
var PORT = 3000;
app.use(express.static('./app'));

var server = app.listen(PORT, function () {
    console.log('Example app listening at http://localhost:' + PORT);
});