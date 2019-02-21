
var auth = require('basic-auth')


function requiresLogin(req, res, next) {
	var user = auth(req)
	if (user.email && user.password) {
	  User.authenticate(user.email, user.password, function (error, user) {
	    if (error || !user) {
	      var err = new Error('Wrong email or password.');
	      err.status = 401;
	      return next(err);
	    }  else {
	      req.locals.userId = user._id;
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
