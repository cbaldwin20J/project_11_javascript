var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Course = require('../models/course');
var Review = require('../models/review');
var auth = require('basic-auth')
var mid = require('../middleware');







//******************************************************************88


// GET /api/users 200 - Returns the currently authenticated user

router.get('/users', mid.requiresLogin, function(req, res, next) {
  // if the user is logged in I guess
  User.findById(req.userId)
      .exec(function (error, user) {
        if (error) {
          return next(error);
        } else {
          res.json(user);
        }
      });
});

// POST /api/users 201 - Creates a user, sets the Location header to "/", and returns no content
// *******works
router.post('/users', function(req, res, next) {

  User.create(req.body, function (err, user) {
        if(err) return next(err);
        res.location('/')
        res.status(201);
        res.json()
      });

})


// GET /api/courses 200 - Returns the Course "_id" and "title" properties
// ********** works
router.get("/courses", function(req, res, next){
  Course.find({})
        .select('title')
        .exec(function(err, courses){
          if(err) return next(err);
          // sending our questions as json objects to the server making the request
          res.json(courses);
        });
});

// GET /api/course/:courseId 200 - Returns all Course properties and related documents for the provided course ID
// When returning a single course for the GET /api/courses/:courseId route, use Mongoose population to load the related user and reviews documents.
// ********* works
router.get("/courses/:courseId", function(req, res, next) {
  Course.
    findById(req.params.courseId).
    populate('user').
    populate('reviews').
    exec(function (err, course) {
      if (err) return next(err);
      res.json(course)

    })
})


// POST /api/courses 201 - Creates a course, sets the Location header, and returns no content
// ********* works
router.post("/courses", mid.requiresLogin, function(req, res,next){

  let new_course = new Course(req.body)

  new_course.save(function(err, course){
    if(err) return next(err);
    res.location('/')
    res.status(201);
    res.json()
  });
});

// PUT /api/courses/:courseId 204 - Updates a course and returns no content
// ********* works
router.put("/courses/:courseId", mid.requiresLogin, function(req, res,next){
  console.log("******************* the req.params.courseId: " + req.params.courseId)
  Course.findById(req.params.courseId)
    .exec(function (error, course_to_update) {
          if (error) {
            return next(error);
          } else if (!course_to_update) {
              console.log("************************* ran the else if")
              var the_err = new Error('Course not found with id of ' + req.params.courseId);
              the_err.status = 401;
              return next(the_err);
          }else {
              console.log("****************** course_to_update: " + JSON.stringify(course_to_update))
              course_to_update.update(req.body, function(err, updated_course){
                if(err) return next(err);
                res.json();
              });

          }
    });


});


// POST /api/courses/:courseId/reviews 201 - Creates a review for the specified course ID, sets the Location header to the related course, and returns no content
// ********* works
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