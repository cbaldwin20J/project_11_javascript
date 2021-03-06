// the Review model

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var ReviewSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
            },
    postedOn: {
      type: Date,
      default: Date.now
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    review: {
      type: String
    }
});

var Review = mongoose.model('Review', ReviewSchema);
module.exports = Review;
