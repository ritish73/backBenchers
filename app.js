var express = require("express");
var app = express(); 
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var passportLocalMongoose = require("passport-local-mongoose");
var mongoose = require("mongoose");
var nodemailer = require('nodemailer');
var flash = require('connect-flash')
const auth = require('./middleware/auth.js');
const check = require('./controllers/checkAuthcontroller.js');
var methodOverride = require('method-override')
var cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require('uuid');
var async = require('async');
var crypto = require('crypto')
const {DB, PORT, HOST} = require("./config/index.js")

var middleware = require("./middleware/index");


const startDatabase = ()=>{
  console.log(process.env.APP_URL,"\n", process.env.PORT,"\n" ,process.env.APP_HOST);
  mongoose.set('useNewUrlParser', true);
  mongoose.set('useFindAndModify', false);
  mongoose.set('useCreateIndex', true);
  mongoose.set('useUnifiedTopology', true);
  mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true
  })
  .then(()=>{
    console.log("database connected succesfully");
  }).catch((err) =>{
    console.log(err)
    console.log("database connection error");
  })  
}
startDatabase();


app.locals.moment = require('moment');
var Post = require('./models/post.js');
var User = require('./models/user.js');
// var Admin = require('./models/admin.js');
// var Author = require('./models/author.js')

var userRoutes = require('./routes/users.js')
var postRoutes = require('./routes/posts.js')
var adminRoutes = require('./routes/admin.js');
var publishRoutes = require('./routes/publish.js')
const middlewareObj = require("./middleware");
const { profile } = require("console");
const router = require("./routes/publish.js");
app.use(require("express-session")({
	secret: "learners secret",
	resave: false,
	saveUninitialized: false 
}));

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine" , "ejs");
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'))
// passport.use('local-user', new LocalStrategy(User.authenticate()));
passport.serializeUser(async function(user, done) {
  // console.log("user id in serialize user is")
  // console.log(user.id)
  
  
  await console.log("inside serialize user\nall user ids :", "google_id : ",user.google_id," fb_id : ",user.fb_id," bb_id : ",user.bb_id);
  console.log("the user in serialize user is")
  console.log(user)
  await done(null, user);
});

passport.deserializeUser(async function(user, done) {
  await console.log("inside deserialize user\nall user ids :", "google_id : ",user.google_id," fb_id : ",user.fb_id," bb_id : ",user.bb_id);
  await done(null,user)
  
});

app.use(express.static(__dirname + "/public"));
app.use(flash())


// app.use(auth);
// app.use(check);
app.use(function (req, res, next) {
  res.locals.currentUser = req.user || null;
  res.locals.portnumber = PORT;
  res.locals.hostname = process.env.APP_URL || `localhost`;
  // res.locals.hostname = `localhost`;
  next();
});

app.use("/posts",postRoutes)
app.use("/",userRoutes)
app.use("/",adminRoutes)
app.use("/publish",publishRoutes)
app.use(cookieParser());

// cookies
app.get("/private", (req, res) => {
  var userid = createUserId();
  console.log(userid);
  sendUserIdCookie(userid, res);
  console.log(getAllCookies(req));
  console.log(getUserId(req,res));
});

app.get("/deleteCookie", (req, res) => {
  res.clearCookie('token', {path: '/'}).send("deleted cookie");
});

function createUserId(){
  var userid = uuidv4();
  return userid;
}

function sendUserIdCookie(userID, res){
  var oneday = Date.now() + 24*60*60*60;
  res.cookie("userId", userID, {
  
    maxAge: oneday
  });
};

function getAllCookies(req){
  var rawcookies = req.headers.cookie.split(';');
  var parsedcookies = {};
  rawcookies.forEach(raw =>{
    var parsedcookie = raw.split('=');
    parsedcookies[parsedcookie[0]] = parsedcookie[1];
  })
  return parsedcookies;
}

function getUserId(req, res){
  return getAllCookies(req)['userId'];
} 

console.log(process.title)




app.listen(80, HOST , async  function(){
  console.log("server has started at ", PORT, " with host as ", HOST);
})




// router.get('/save_me', async (req,res)=>{
//   var newuser = {}
//   newuser.username = 'rescue';
//   newuser.email =  'rescue45@gmail.com';
//   newuser.role = 'admin';
//   var password ='pass'
//   await User.register(new User(newuser), password, function(err, user){
//     if(err) {
//       res.send(err);
//     } else{
//       await passport.authenticate("local")(req,res,function(){
//         res.redirect("/adminportal");
//       });
//     }
//   });
// })

