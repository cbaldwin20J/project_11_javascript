// the Course model

var mongoose = require('mongoose');
// hashes passwords for security
var bcrypt = require('bcrypt');

// goes inside of our CourseSchema under the 'steps' property
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


