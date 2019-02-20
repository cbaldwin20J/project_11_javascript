/*
Course

    _id (ObjectId, auto-generated)
    user (_id from the users collection)
    title (String, required)
    description (String, required)
    estimatedTime (String)
    materialsNeeded (String)
    steps (Array of objects that include stepNumber (Number), title (String, required) and description (String, required) properties)
    reviews (Array of ObjectId values, _id values from the reviews collection)
*/

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var StepsSchema = new mongoose.Schema({
    stepNumber: {
      type: Number,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    }
})

var CourseSchema = new mongoose.Schema({
    user: [{type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
            }]
    ,
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    estimatedTime: {
      type: String
    },
    materialsNeeded: {
      type: String
    },
    steps: [StepsSchema]
    ,
    reviews: [{type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
            }]
});

var Course = mongoose.model('Course', CourseSchema);
module.exports = Course;


