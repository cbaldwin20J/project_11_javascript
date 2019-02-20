var express = require('express');
var router = express.Router();
var User = require('../models/user');
var mid = require('../middleware');

// GET /profile
router.get('/profile', mid.requiresLogin, function(req, res, next) {
  // if the user is logged in I guess
  User.findById(req.session.userId)
      .exec(function (error, user) {
        if (error) {
          return next(error);
        } else {
          return res.render('profile', { title: 'Profile', name: user.name, favorite: user.favoriteBook });
        }
      });
});

// GET /logout
router.get('/logout', function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

// GET /login
router.get('/login', mid.loggedOut, function(req, res, next) {
  return res.render('login', { title: 'Log In'});
});

// POST /login
router.post('/login', function(req, res, next) {
  if (req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      }  else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  } else {
    var err = new Error('Email and password are required.');
    err.status = 401;
    return next(err);
  }
});

// GET /register
router.get('/register', mid.loggedOut, function(req, res, next) {
  return res.render('register', { title: 'Sign Up' });
});

// POST /register
router.post('/register', function(req, res, next) {
  if (req.body.email &&
    req.body.name &&
    req.body.favoriteBook &&
    req.body.password &&
    req.body.confirmPassword) {

      // confirm that user typed same password twice
      if (req.body.password !== req.body.confirmPassword) {
        var err = new Error('Passwords do not match.');
        err.status = 400;
        return next(err);
      }

      // create object with form input
      var userData = {
        email: req.body.email,
        name: req.body.name,
        favoriteBook: req.body.favoriteBook,
        password: req.body.password
      };

      // use schema's `create` method to insert document into Mongo
      User.create(userData, function (error, user) {
        if (error) {
          return next(error);
        } else {
          req.session.userId = user._id;
          return res.redirect('/profile');
        }
      });

    } else {
      var err = new Error('All fields required.');
      err.status = 400;
      return next(err);
    }
})

// GET /
router.get('/', function(req, res, next) {
  return res.render('index', { title: 'Home' });
});

// GET /about
router.get('/about', function(req, res, next) {
  return res.render('about', { title: 'About' });
});

// GET /contact
router.get('/contact', function(req, res, next) {
  return res.render('contact', { title: 'Contact' });
});

module.exports = router;





'use strict';

var express = require("express");
var router = express.Router();
var Question = require("./models").Question;

// this is like a shortcut
// any url in router with a param of ':qID'
// we will find that question instance with the matching 'qID'
// and send it to the router with the matching url in 'req.question'
router.param("qID", function(req,res,next,id){
  Question.findById(id, function(err, doc){
    if(err) return next(err);
    if(!doc) {
      err = new Error("Not Found");
      err.status = 404;
      return next(err);
    }
    // 'doc' is our matching Question instance and we put it in
    // req.question to be used in a router below
    req.question = doc;
    return next();
  });
});

// this is like a shortcut
// any url in router with a param of ':aID'
// we will find that question instance with the matching 'aID'
// and send it to the router with the matching url in 'req.answer'
router.param("aID", function(req,res,next,id){
  // saves the matching question instance to 'req.answer' to be used in a below route
  req.answer = req.question.answers.id(id);
  if(!req.answer) {
    err = new Error("Not Found");
    err.status = 404;
    return next(err);
  }
  next();
});

// GET /questions
// Route for questions collection
router.get("/", function(req, res, next){
  Question.find({})
        .sort({createdAt: -1})
        // 'exec' means take the '.sort'ed object and send it through
        .exec(function(err, questions){
          if(err) return next(err);
          // sending our questions as json objects to the server making the request
          res.json(questions);
        });
});

// POST /questions
// Route for creating questions
router.post("/", function(req, res, next){
  var question = new Question(req.body);
  question.save(function(err, question){
    if(err) return next(err);
    res.status(201);
    res.json(question);
  });
});

// GET /questions/:id
// Route for specific questions
router.get("/:qID", function(req, res, next){
  // we already got the Question instance from above in the router.param("qID")
  // its in 'req.question'
  res.json(req.question);
});

// POST /questions/:id/answers
// Route for creating an answer
router.post("/:qID/answers", function(req, res,next){
  // we already got the Question instance from above in the router.param("qID")
  // its in 'req.question'
  req.question.answers.push(req.body);
  req.question.save(function(err, question){
    if(err) return next(err);
    res.status(201);
    res.json(question);
  });
});

// PUT /questions/:qID/answers/:aID
// Edit a specific answer
router.put("/:qID/answers/:aID", function(req, res){
  // we already got the Answer instance from above in the router.param("aID")
  // its in 'req.answer' and
  req.answer.update(req.body, function(err, result){
    if(err) return next(err);
    res.json(result);
  });
});

// DELETE /questions/:qID/answers/:aID
// Delete a specific answer
router.delete("/:qID/answers/:aID", function(req, res){
  // we already got the Answer instance from above in the router.param("aID")
  // its in 'req.answer' and
  req.answer.remove(function(err){
    req.question.save(function(err, question){
      if(err) return next(err);
      res.json(question);
    });
  });
});

// POST /questions/:qID/answers/:aID/vote-up
// POST /questions/:qID/answers/:aID/vote-down
// Vote on a specific answer
// we will send 'up' or 'down' to ':dir' so it will be 'vote-up' or 'vote-down'
router.post("/:qID/answers/:aID/vote-:dir",
  function(req, res, next){

    if(req.params.dir.search(/^(up|down)$/) === -1) {
      var err = new Error("Not Found");
      err.status = 404;
      next(err);
    } else {
      req.vote = req.params.dir;
      next();
    }
  },
  // you can chain callbacks
  function(req, res, next){
    // we already got the Answer instance from above in the router.param("aID")
    // its in 'req.answer'
    // '.vote' is our instance method we created in the models page in the schema
    req.answer.vote(req.vote, function(err, question){
      if(err) return next(err);
      res.json(question);
    });
});

module.exports = router;




