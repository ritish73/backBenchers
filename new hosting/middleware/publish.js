var Post = require('../models/post.js');
var User = require('../models/user.js');
var moment = require('moment');
var middleware = {}
// middleware for checking if user is logged in 
middleware.isLoggedIn = (req, res, next)=>{
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/register_or_login");
}

middleware.convertDate = (given_date)=>{
  var formatted_date = moment(given_date).format('YYYY-MM-DD');
  // console.log(formatted_date);
  return formatted_date;
}



module.exports = middleware;