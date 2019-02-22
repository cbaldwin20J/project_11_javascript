// the routes for this app

var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Course = require('../models/course');
var Review = require('../models/review');

var mid = require('../middleware');


// Returns the currently authenticated user
// 'mid.requiresLogin' is our middleware
router.get('/users', mid.requiresLogin, function(req, res, next) {
  User.findById(req.userId)
      .exec(function (error, user) {
        if (error) {
          return next(error);
        } else {
          res.json(user);
        }
      });
});


// Creates a user
router.post('/users', function(req, res, next) {
  User.create(req.body, function (err, user) {
        if(err) return next(err);
        res.location('/')
        res.status(201);
        res.json()
      });
})


// Returns all courses with just their "_id" and "title" properties
router.get("/courses", function(req, res, next){
  Course.find({})
        .select('title')
        .exec(function(err, courses){
          if(err) return next(err);
          // sending our questions as json objects to the server making the request
          res.json(courses);
        });
});


// Returns all Course properties and related documents for the provided course ID
router.get("/courses/:courseId", function(req, res, next) {
  Course.
    findById(req.params.courseId).
    // 'populate' will find the user instance with the matching id and return all of its properties
    populate('user').
    populate('reviews').
    exec(function (err, course) {
      if (err) return next(err);
      res.json(course)
    })
})


// Creates a course
router.post("/courses", mid.requiresLogin, function(req, res,next){

  let new_course = new Course(req.body)

  new_course.save(function(err, course){
    if(err) return next(err);
    res.location('/')
    res.status(201);
    res.json()

  });
});


// Updates a course
router.put("/courses/:courseId", mid.requiresLogin, function(req, res,next){
  Course.findById(req.params.courseId)
    .exec(function (error, course_to_update) {
          if (error) {
            return next(error);
          } else if (!course_to_update) {
              let the_err = new Error('Course not found with id of ' + req.params.courseId);
              the_err.status = 401;
              return next(the_err);
          }else {
              course_to_update.update(req.body, function(err, updated_course){
                if(err) return next(err);
                res.json();
              });
          }
    });
});


// Creates a review for the specified course ID
router.post("/courses/:courseId/reviews", mid.requiresLogin, function(req, res,next){
  Course.findById(req.params.courseId)
    .exec(function (error, course) {
          if (error) {
            return next(error);
          } else {
            let review = new Review(req.body)
            review.save(function(err, review){
              if(err) return next(err);
              course.reviews.push(review._id)
              course.save(function(err, the_course){
                if(err) return next(err);
                res.status(201);
                res.json(the_course);
              });
            });
          }
    });
});


module.exports = router;

/*
****************POSTMAN

****For creating a User
{
  "fullName": "John Labowski",
  "emailAddress": "john@gmail.com",
  "password": "BigJ#$@"
}

****For creating a Course
      left out 'user', 'steps' and 'reviews' foreignkeys
{
  "title": "Python 101",
  "description": "Basics of Python",
  "estimatedTime": "50 minutes",
  "materialsNeeded": "paper and pencil"
}

****For creating a Review
      left out postedOn because it has a default
      can send it to the course with id of 5c6eef9cd5a78ff6a85c52c8
{
  "user": "57029ed4795118be119cc437",
  "rating": "4",
  "review": "I learnt a lot from this class"
}






*/