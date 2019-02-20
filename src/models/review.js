/*
Review

    _id (ObjectId, auto-generated)
    user (_id from the users collection)
    postedOn (Date, defaults to “now”)
    rating (Number, required, must fall between “1” and “5”)
    review (String)
*/

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var ReviewSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
            },
    postedOn: {
      type: String,
      required: true,
      trim: true
    },
    rating: {
      type: String,
      required: true,
      trim: true
    },
    review: {
      type: String,
      required: true
    }
});

var Review = mongoose.model('Review', ReviewSchema);
module.exports = Review;
