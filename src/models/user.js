/*
User

    _id (ObjectId, auto-generated)
    fullName (String, required)
    emailAddress (String, required, must be unique and in correct format)
    password (String, required)
*/

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var UserSchema = new mongoose.Schema({
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    emailAddress: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
            validator: function(email_input) {
              return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(email_input);
            },
            message: props => `${props.value} is not a valid email!`
          },
    },
    password: {
      type: String,
      required: true
    }
});

// authenticate input against database documents
UserSchema.statics.authenticate = function(email, password, callback) {
  console.log("***************passed through email and password: " + email + " -- " + password)
  User.findOne({ emailAddress: email })
      .exec(function (error, user) {
        console.log("************the user in user.js: " + JSON.stringify(user))
        if (error) {
          return callback(error);
        } else if ( !user ) {
          var err = new Error('User not found.');
          err.status = 401;
          return callback(err);
        }
        bcrypt.compare(password, user.password , function(error, result) {
          if (result === true) {
            return callback(null, user);
          } else {
            return callback();
          }
        })
      });
}


// hash password before saving to database
UserSchema.pre('save', function(next) {
  var user = this;
  bcrypt.hash(user.password, 10, function(err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  })
});


var User = mongoose.model('User', UserSchema);
module.exports = User;
