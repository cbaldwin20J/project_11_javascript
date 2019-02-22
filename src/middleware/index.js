// middleware to require login credentials to access and post to specified content

// gets the login credentials from POSTMANs basic auth
var auth = require('basic-auth')
var User = require('../models/user');


function requiresLogin(req, res, next) {
	// gets the 'name' and 'pass' from POSTMANs basic auth credentials
	var user = auth(req)
	if (user && user.name && user.pass) {
	  // .authenticate is our static method we set on the User model
	  User.authenticate(user.name, user.pass, function (error, user) {
	    if (error || !user) {
	      var err = new Error('Wrong email or password.');
	      err.status = 401;
	      return next(err);
	    }  else {
	      // creating a variable of who is logged in to send to the other routes
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
