'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');

var bodyParser = require('body-parser');
var mongoose = require('mongoose');


const app = express();

mongoose.connect("mongodb://localhost:27017/course-api", {autoReconnect: true}, (err) => {
    if (!err) {
    	console.log('********************************MongoDB has connected successfully.')
    }else{
    	console.log('********************************could not connect to MongoDB.')

    }
});
var db = mongoose.connection;

// mongo error
db.on('error', console.error.bind(console, '***************connection error:'));




// set our port
app.set('port', process.env.PORT || 5000);

// morgan gives us http request logging
app.use(morgan('dev'));

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));



// TODO add additional routes here
var routes = require('./routes/index');
app.use('/api', routes);



// uncomment this route in order to test the global error handler
// app.get('/error', function (req, res) {
//   throw new Error('Test error');
// });

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found'
  })
})

// global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message,
    error: {}
  });
});

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});





