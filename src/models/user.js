// the User model

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
// the 'unique: true' wasn't working and this plugin makes it work
var uniqueValidator = require('mongoose-unique-validator');


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
      // must be a valid email format
      validate: {
            validator: function(email_input) {
              return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(email_input);
            },
            message: props => `${props.value} is not a valid email!`
          }
    },
    password: {
      type: String,
      required: true
    }
});

// reinforces that the 'unique: true' will work
UserSchema.plugin(uniqueValidator);

// will check if the user's login credentials are valid
UserSchema.statics.authenticate = function(email, password, callback) {
  // find the user with the same login email
  User.findOne({ emailAddress: email })
      .exec(function (error, user) {
        if (error) {
          return callback(error);
        } else if ( !user ) {
          var err = new Error('User not found.');
          err.status = 401;
          return callback(err);
        }
        // compare the hashed passwords to see if they match using bcrypt
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
// '.pre('save')' means this will run before a User model is saved
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
