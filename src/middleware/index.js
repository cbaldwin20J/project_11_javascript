
var auth = require('basic-auth')
var User = require('../models/user');


function requiresLogin(req, res, next) {
	var user = auth(req)
	console.log("****************user: " + JSON.stringify(user))
	if (user.name && user.pass) {
	  User.authenticate(user.name, user.pass, function (error, user) {
	    if (error || !user) {
	      var err = new Error('Wrong email or password.');
	      err.status = 401;
	      return next(err);
	    }  else {
	      req.userId = user._id;
	      return next();
	    }
	  });
	} else {
	  var err = new Error('Email and password are required.');
	  err.status = 401;
	  return next(err);
	}

}
module.exports.requiresLogin = requiresLogin;

// password and hashed password for user with email chris@gmail.com
// Chris!!!
// $2b$10$vhJQrh0QeAALvQ3y5chL3.mWCUwK7B3xE2piXdAV2a9rFmC70wkRW"