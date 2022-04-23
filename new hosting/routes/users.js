var express = require("express");
var app = express();
var moment = require("moment");
var FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
var router  = express.Router();
var async = require('async')
var crypto = require('crypto')
var flash = require('connect-flash')
var nodemailer = require('nodemailer')
var passport = require("passport");
var Post = require('../models/post.js');
var User = require('../models/user.js');
var Ip = require('../models/ip.js');
const Trending = require("../models/trending.js");
const Popular = require("../models/popular.js");
const Recommended = require("../models/recommended.js");
const Review = require("../models/review.js")
const middlewareObj = require("../middleware/index.js");
const auth = require("../middleware/auth.js");
const check = require("../controllers/checkAuthcontroller");
const dashboardObj = require("../controllers/dashboardcontroller.js");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
const ejsLint = require('ejs-lint');
var multer = require('multer');
const nodemailerSendgrid = require('nodemailer-sendgrid');
const {USER, PASS, HOSTNAME, PROTOCOL} = require("../config/index")
const { 
  FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, F_callback_url,
  GOOGLE_APP_ID,GOOGLE_APP_SECRET,G_callback_url        
} = require("../config/third_party_auth.js")




// multer setup

var storage = multer.diskStorage({
  destination: function(req,file,cb){
    cb(null,'public/uploads/img/profile-pics');
  },
  filename: function(req,file,cb){
      var uid = req.user.bb_id;
      // const extension = file.mimetype.split('/')[1];
      // console.log(uid +"_"+ file.originalname, extension);
      cb(null,uid + "_" + file.originalname);
  }
});

var multerFilter = (req,file,cb)=>{
  const extension = file.mimetype.split('/')[1];
  console.log(extension)
  if(extension === 'jpeg' || extension === 'png' || extension === 'jpg' || extension === 'JPEG' || extension === 'PNG' || extension === 'JPG'){
    cb(null,true);
  } else {
    return cb(new Error('Only png, jpg, jpeg format allowed!'), false);
  }
};

var upload = multer({
  storage: storage,
  multerFilter: multerFilter
});





const transport = nodemailer.createTransport(
  nodemailerSendgrid({
    apiKey: "SG.B1IJJAIJRQaThbsOibOhuw.ITEDqiEbtNvqRqLRTNZNqRAeAXFbDG8NgmAYnJMv2Sw"
  })
  )

  // let testData = {a: 1, b: 2}
  // const childPython = spawn('python', ['hello.py', JSON.stringify(testData)])

  // childPython.stdout.on('data' , (data)=>{
  //   console.log(`stdout : ${data}`);
  // })

  // childPython.stderr.on('data' , (data)=>{
  //   console.log(`stderr : ${data}`)
  // })

  // childPython.on('close', (code)=>{
  //   console.log(`Child proess exited with code : ${code}`)
  // })

  // remove profile picture
  router.get("/removeProfilePic", auth, async (req,res)=>{

    try{
      User.findOneAndUpdate({_id: req.user._id}, {image: null}, ()=>{
        res.json({message: 'profile picture removed', status : 1});
      });  

    } catch(e) {
      res.json({message: e.message, status: 0});
    }
    

    
  })



router.get('/aboutus',(req,res)=>{
  res.render('aboutus');
})

router.get('/pprough',(req,res)=>{
  res.render('privacypolicy');
})


router.get("/" , check ,function(req, res){
  // console.log("in home : ",req.user)
  var message=undefined;
  if(req.query.message){
    message = req.query.message;
  }
  // console.log("all user ids :", "google_id : ",req.user.google_id," fb_id : ",req.user.fb_id," bb_id : ",req.user.bb_id);
  var obj = new Object();
  // console.log("req.user and req.is authenticated  : " ,req.isAuthenticated(), req.user )
  var call  = async function(){
    await middlewareObj.getPostsHomePage(obj);
    console.log("<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>",obj);
      var betrendingpost = obj.betrendingpost
      var ctrendingpost = obj.ctrendingpost
      var etrendingpost = obj.etrendingpost
      var pdtrendingpost = obj.pdtrendingpost

      var bepopularpost = obj.bepopularpost
      var cpopularpost = obj.cpopularpost
      var epopularpost = obj.epopularpost
      var pdpopularpost = obj.pdpopularpost

      var berecommendedpost = obj.berecommendedpost
      var crecommendedpost = obj.crecommendedpost
      var erecommendedpost = obj.erecommendedpost
      var pdrecommendedpost = obj.pdrecommendedpost

      const reviews = await Review.find({});

      res.render("home", 
    {
      betrendingpost: betrendingpost,
      ctrendingpost: ctrendingpost,
      etrendingpost: etrendingpost,
      pdtrendingpost: pdtrendingpost,

      bepopularpost: bepopularpost,
      cpopularpost: cpopularpost,
      epopularpost: epopularpost,
      pdpopularpost: pdpopularpost,

      berecommendedpost: berecommendedpost,
      crecommendedpost: crecommendedpost,
      erecommendedpost: erecommendedpost,
      pdrecommendedpost: pdrecommendedpost,
      reviews: reviews,
      message: req.flash('success')
      // async: true 
    }
    
    );

  }
  call();
  
  var ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     (req.connection.socket ? req.connection.socket.remoteAddress : null);
    //  console.log(ip);
     Ip.findOne({ip_address: ip}, (err,foundip)=>{
       if(err) console.log(err);
       else if(!foundip){
        var newip = new Ip();
        newip.ip_address = ip;
        newip.count = 1;
        newip.save()
       } else if(foundip){
        foundip.count += 1;
        foundip.save();
       }
     })
  // console.log("user is successfully serialized in home page")
  // console.log(req.user)
  
});

router.get('/delete', check ,async (req,res)=>{

    var user = await User.findOne({_id: req.user._id});
    user.deleted = true;
    user.deletedAt = moment().format('MMMM Do YYYY, h:mm:ss a');
    await user.save();

    // send an email
    var cust;

    if(user.google_email){
      cust = user.google_email;

    } else if(user.fb_email){
      cust = user.fb_email;
    } else {
      cust = user.email;
    }


    var message = {

      from: USER,
      to: cust,
      subject: `Account Terminated`,
      
      html: ` 
   
      <p>Dear User,</p>
      <p>We’re sorry to see you go. </p>
      <p>To help us improve our services, please let us know where you found us lacking.</p>
      <p>In case you happen to change your mind, you can always come back and retrieve the same account
      within 45 days from date of deletion by dropping us a message on our official mailing id.</p>

      <p>We hope and wish to see you again!!!</p>
      
     
      <br><br>
      <p>Regards,</p>
      <p>Team Backbenchers</p>
      

      `

    }
    transport.sendMail(message, (err)=>{
      if(err) console.log(err)
      else{
        console.log("account deletion mail has been sent");
      }
    });



    req.flash('success','your account was deleted.');
    res.redirect("/")
      
  
  
})

router.get("/termsandconditions", function(req, res){
  res.render("termsandconditions");
});

router.get("/privacypolicy", function(req, res){
  res.render("privacypolicy");
});

router.get("/blogs",(req,res)=>{
  res.render('allblogspage')
})

router.get('/myposts',(req,res)=>{
  if(!req.user){
    res.redirect("/register_or_login");
  }
  User.findById(req.user._id).populate("posts").exec(function(err,user){
    if(err){
      console.log("Error occured while displaying all posts written by current user");
      console.log(err);
    } else{
      res.render("userposts",{posts: user.posts});
      
    }
  })
})

router.get('/findUser', auth, (req,res)=>{
  var CurrentUser
  console.log("request made by ajax to find user")
  if(req.user === null){
    res.json({CurrentUser: null});
  } else {
    res.json({CurrentUser: req.user});
  }
})

router.get('/addFollower/:authname', auth , async (req,res)=>{
  console.log("req.params.authname = " + req.params.authname)
  console.log("hhhhhhhhhhhhhhhhh")
  // add currentuser to follower list of this author
  req.flash('success','Channel subscribed!')
  await middlewareObj.addFollower(res,req)
  .then((message)=>{
    res.json({message : message})
  })
  
})

router.get('/sharePost/:slug', auth, async (req,res)=>{

  await middlewareObj.sharePost(req);
  var thepost = await Post.findOne({slug:req.params.slug});
  res.json({value: thepost.shares});
})

router.get("/savetolater/:slug", check ,(req,res)=>{
  // console.log("request made")
  // console.log(req.user)
    Post.findOne({slug: req.params.slug}, (err,foundpost)=>{
      if(err) console.log(err)
      else if(req.user){
        User.findById(req.user._id).populate("saved_for_later").exec(async function(err,user){
          if(err) console.log(err)
          else {
            
            var ispushed = 0
            console.log("before length: " + user.saved_for_later.length)
            for(var i=0; i<user.saved_for_later.length;i++){
              
              if(foundpost.title === user.saved_for_later[i].title){
                console.log("entered")
                ispushed = 1 
              }
            }
            console.log("ispushed: " + ispushed)
  
            if(!ispushed){
              console.log("post pushed to save to later posts of : " + req.user.username)
              await user.saved_for_later.push(foundpost);
              await user.save((err,user)=>{
                if(err) console.log(err)
                else {
                  console.log("after length: " + user.saved_for_later.length)
                  console.log("this is the user who wants to add to watch later list", user)
                  res.json({message: 'Added to saved posts.'});
                }
              })
              
            } else {
              res.json({message: 'Post is already saved.'});
            }
            
  
          }
        })
      } else{
        console.log("no one is logged in");
        res.json({message : "Please login to save the post."})
      }
    })
})


// FACEBOOK AUTHENTICATION
// facebook strategy
passport.use(new FacebookStrategy(
  {
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: F_callback_url,
    profileFields: ['id', 'displayName', 'name', 'gender', 'picture.type(large)', 'email']
  }, 
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    middlewareObj.helperFacebookAuth(accessToken, refreshToken, profile, done);
  }))

router.get("/auth/facebook", passport.authenticate('facebook',{ scope:'email'}));

router.get("/auth/facebook/callback",passport.authenticate('facebook',{
  failureRedirect: "/register_or_login?message=An error occured while authentication with facebook'"
}), async(req,res)=>{
  if(req.user){
    if(req.user.fb_id) {
     res.cookie('_fb_token' ,req.user.fb_id);
    } else if(req.user.google_id){
      res.cookie('_google_token', req.user.google_id)
    }
  }
    // Successful authentication, redirect home.
    res.redirect('/');
  }
)




// Google Authentication

passport.use(new GoogleStrategy({
  clientID: GOOGLE_APP_ID,
  clientSecret: GOOGLE_APP_SECRET,
  callbackURL: G_callback_url
},
// api key AIzaSyCn8rZMwbOxiTAU08ObK9dFPuz-p53PbMU
function(accessToken, refreshToken, profile, done) {
  console.log("helpergoogleAuth", profile);
  middlewareObj.helperGoogleAuth(accessToken, refreshToken, profile, done);
  })
);



router.get('/google',passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/register_or_login?message=An error occured while authentication with google' }),
  function(req, res) {

    // if the user with google eamil already exists either as simple or googlr user do not authenticate

    console.log("/google/callback")


    if(req.user){
     if(req.user.fb_id) {
      res.cookie('_fb_token' ,req.user.fb_id);
    } else if(req.user.google_id){
      res.cookie('_google_token', req.user.google_id)
    }
  }
    // Successful authentication, redirect home.
    res.redirect('/');
  });


router.get("/failed", (req,res)=>{
  res.send("you failed ass hole!!!!!!");
})





// register nw user get and post routes
router.get("/register_or_login", (req,res)=>{
  var message;
  console.log(req.query.m)
  if(req.query.m === '0'){
    console.log("hhhhhhhhhhhhh")
    req.flash('error','Login to perform this action.')
    res.redirect("/register_or_login")
  }else{
    res.render("register");
  }
});

router.post("/register_old",(req,res)=>{
  var numberofusers;
  
    User.countDocuments({},(err, num)=>{
      if(err) console.log(err)
      else{
        console.log(num)
        numberofusers = num;
        var validpass = validatePass(req.body.password)
        var uid = numberofusers + 1;
        if(validpass.status){

          const myfunction = async ()=>{          
            // const isMatch = await bcrypt.compare(password, hashedPassword); //return a boolean value
            var user = new User();
            
            user.username =  req.body.username;
            user.password =  req.body.password;
            user.email =  req.body.email;
            user.bb_id =  uid;
            
            user.save().then(()=>{
              console.log(user);
              res.status(200);
              passport.authenticate("local-user")(req,res,function(){
                res.redirect("/");
              })
            }).catch((e)=>{
              console.log(e);
              res.status(400).redirect("/register_or_login");
            })
          }
          myfunction();

        } else {
          console.log("user creation unsuccessful")
          // for(var i=0;i<validpass.message.length;i++){
          //   validpass.message[i] = req.flash('error',validpass.message[i])
          // }
          res.render('register',{message: validpass.message})
        }
      }
      
    
    });
})







router.post("/register",async (req,res)=>{

  try{


    // first check if a user with provided email exist throw an eroor
  var useralready = await User.findOne({email: req.body.email});
  if(useralready){
    throw new Error('Email already exists.');
  }

  if(/^\s/.test(req.body.username)){
    throw new Error('Your username must not start with space.')
  }

  if(/\s$/.test(req.body.username)){
      throw new Error('Your username must not end with space.')
  }
  
  var numberofusers;
  // first send an email for verifying the account with a timed token if link is clicked.
  
  // if token is expired don't make account 
  // if link is not clicked don't make account
    User.countDocuments({},(err, num)=>{
      if(err) console.log(err)
      else{
        console.log(num)
        numberofusers = num;
        var validpass = validatePass(req.body.password)
        // var validpass = {};
        // validpass.status = 1;
        var uid = numberofusers + 1;
        if(validpass.status){

          const myfunction = async ()=>{
            var user = new User();
            
            user.username =  req.body.username;
            user.password =  req.body.password;
            user.email =  req.body.email;

            user.emailVerificationToken = crypto.randomBytes(64).toString('hex');
            user.emailVerificationTokenExpires = Date.now() + 86400000;    // 24 hours  24*60*60*1000
            const link = "https://thebackbenchers.co/verifyEmail?token="+user.emailVerificationToken;
            // send the email
            var message = {

              from: USER,
              to: req.body.email,
              subject: `Account Verification`,
              
              html: ` 


               <p>Dear User,</p>
                <p>Welcome to the BackBenchers community!<br>
                Thanks for signing up.<br>
                We firmly believe that every member of the community is an asset helping us
                in attaining our ultimate goal of making education highly affordable and
                promoting the same irrespective of the field. <br>
                To aid us in a better way and contribute your part, 
                please confirm that you want to use this email address for your account.<br>
                The given link will be active for a period of 30 minutes only.<br>
                <button style="outline:none;border:none;background-color:#5995fd;border:1px solid white;border-radius:3px;padding:7px"><a style="text-decoration:none;color:white;font-size:15px;font-family:'poppins',sans-serif" href="${link}">Verify Account</a></button>
              
                <br><br>
                <p>Regards,</p>
                <p>Team Backbenchers</p>
              
              
              `
            }
            transport.sendMail(message, (err)=>{
              if(err) console.log(err)
              else{
                console.log("email verification mail has been sent");
              }
            });
            user.bb_id =  uid;
            console.log(moment().format('MMMM Do YYYY, h:mm:ss a'))
            user.createdAt = moment().format('MMMM Do YYYY, h:mm:ss a');
            await user.hashPassword()
            await user.save().then(async ()=>{
              // console.log(user);
              const token = await user.generateAuthToken();
              res.cookie('bearer_token', token,{
                httpOnly: true,
                path: '/',
                maxAge: 86400000
              });
              req.flash('success','Kindly check your mail inbox for account verification.')
              res.redirect("/");
            })
          }
          myfunction();

        } else {
          console.log("user creation unsuccessful")
          // for(var i=0;i<validpass.message.length;i++){
          //   validpass.message[i] = req.flash('error',validpass.message[i])
          // }
          res.render('register',{message: validpass.message})
        }
      }
    });



  } catch(e){
    console.log(e, e.message);
    req.flash('error', e.message);
    res.redirect('/register_or_login');




  }


  
})




// if user does not verify in the first attempt generate a new link for verification
router.get("/reVerify", check, async (req,res)=>{

  try{
    if(!req.user) throw new Error(' user not found in req.user')
    console.log("this is user while reverifying", req.user)
    // since user is not logged in
    var user = await User.findOne({_id: req.user._id});
    if(!user) throw new Error('Something went wrong, try again');
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpires = null;
    user.emailVerificationToken = crypto.randomBytes(64).toString('hex');
    user.emailVerificationTokenExpires = Date.now() + 86400000;    // 24 hrs

    
    const link = "https://thebackbenchers.co/verifyEmail?token="+user.emailVerificationToken;
    // send the email
    var message = {

      from: USER,
      to: user.email,
      subject: `Account Verification`,
      
      html: ` 
   
      <p>Dear User,</p>
      <p>Welcome to the BackBenchers community!<br>
      Thanks for signing up.<br>
      We firmly believe that every member of the community is an asset helping us
      in attaining our ultimate goal of making education highly affordable and
      promoting the same irrespective of the field. <br>
      To aid us in a better way and contribute your part, 
      please confirm that you want to use this email address for your account.<br>
      The given link will be active for a period of 30 minutes only.<br>
      <button style="outline:none;border:none;background-color:#5995fd;border:1px solid white;border-radius:3px;padding:7px"><a style="text-decoration:none;color:white;font-size:15px;font-family:'poppins',sans-serif" href="${link}">Verify Account</a></button>
    
      <br><br>
      <p>Regards,</p>
      <p>Team Backbenchers</p>
      

      `

      
    }
    transport.sendMail(message, (err)=>{
      if(err) console.log(err)
      else{
        console.log("email verification mail has been sent");
      }
    });

    await user.save(()=>{
      req.flash('success','Kindly check your mail inbox for account verification.')
      res.redirect("/");
    })


  }catch(e){

    req.flash('error',e.message)
    res.redirect('/');

  }

})


router.get("/verifyEmail", async (req,res)=>{
  try{
    var user = await User.findOne({emailVerificationToken: req.query.token, emailVerificationTokenExpires: { $gt: Date.now() } });
    if(!user) {
      console.log("token is invalid");
      throw new Error('Link sent for account verification has expired.');
    } else {
      user.emailVerificationToken = null;
      user.emailVerificationTokenExpires = null;
      user.isVerified = true;
      await user.save();
      req.flash('success','Your account has been verified successfully, Welcome to the BackBenchers!')
      res.redirect("/")
    }

  } catch(err){
    console.log(err);
    req.flash('error', err.message)
    res.redirect("/");
  }
})


router.post("/login" , async (req,res)=>{
  try{
    
    const token = await req.cookies.bearer_token;
    // console.log("token from cookiee : ", token);
    const user = await User.findByCredentials(req.body.username, req.body.password, req, res);
    console.log(user)
    // console.log("user: ", user);
    if(user){
      // console.log("all user ids :", "google_id : ",user.google_id," fb_id : ",user.fb_id," bb_id : ",user.bb_id);
      if(user.deleted){
        throw new Error('Account does not exists.')
      }
      // console.log( "req.token: " ,req.token)
      if(!token){
        // this case occors if jwt cookie is deleted on the client side
        // delete previous tokens
        console.log(user.tokens.length)
        user.tokens.length = 0;
        console.log("after  deleting: " ,user.tokens.length)
        await user.save();
        // create token
        const newtoken = await user.generateAuthToken();
        console.log("token: ", newtoken);
        await res.cookie('bearer_token', newtoken,{
          httpOnly: true,
          path: '/',
          maxAge: 86400000
        });
        req.user = user;
        req.flash('success','Welcome back!')
        res.redirect('/')
      } else{
        // first check that is that token of the same user who provided credits
        if(token in user.tokens){
          console.log("token in user.tokens.token")
          // verify token
          console.log('token already present')
          console.log(token);
          const decoded = await jwt.verify(token, 'thisisjwtsecret');
          console.log("decoded" ,decoded)
          const userwithtoken = await User.findOne({_id  : decoded._id, 'tokens.token': token});
          console.log( "userwithtoken : ",userwithtoken)
          if(!userwithtoken){
            throw new Error('user was not found with jwt token in the cookie');
          } else{
            req.user = await userwithtoken;
            console.log('token verified')
            req.flash('success','Welcome back!')
            res.redirect('/')
          }
        } else {
          // create token for this user and delete previous token from the cookie
          const newtoken = await user.generateAuthToken();
          console.log("token: ", newtoken);
          await res.clearCookie('bearer_token');
          await res.cookie('bearer_token', newtoken,{
            httpOnly: true,
            path: '/',
            maxAge: 86400000
          });
          req.user = user;
          req.flash('success','Welcome back!')
          res.redirect('/')
        } 
      } 
    }
    
  } catch(err){
    console.log("An error occured : ", err.message)
    // console.log(typeof err)
    req.flash('error',err.message)
    res.redirect('/register_or_login')
  }
})


router.get("/logout", auth, async (req,res)=>{
  try{

    if(req.user.google_id || req.user.fb_id){
      console.log("logging out google or fb user");
      if(req.user.google_id || req.cookies._google_token){
        res.clearCookie('_google_token');
       
      }
      if(req.user.fb_id || req.cookies._fb_token){
        res.clearCookie('_fb_token');
      }
      res.clearCookie('connect.sid')
    
      req.user = null;
    
      req.session = null;
     
      req.logout();
    
      // req.flash('success', 'you were logged out successfully')
    
      res.redirect("/")
   
    } else {
      // console.log("tokens : ", req.user.tokens)
      req.user.tokens = await req.user.tokens.filter((token)=>{
        // console.log(" comparing tokens and deleting while logging out ",  token.token.localeCompare(req.token));
        return token.token !== req.token;
      });
      await req.user.save((err,user)=>{
        if(err) console.log(err)
        else{
          console.log("user was saved successfully after deleting the jwt from the database");
        }
      });
      res.clearCookie('bearer_token');
      // req.flash('success', 'you were logged out successfully')
      res.redirect('/') 
    }
   } catch(err){
      res.status(500).send({"error": 'There was an error logging you out'});
      
    }
})



router.post("/updateUser", auth, async (req,res)=>{

  try{


  var user = await User.findById(req.user._id);
  if(user.google_id){ 


    if(!req.body.google_username){
      throw new Error('Enter your username.')
    }

    if(/^\s/.test(req.body.google_username)){
      throw new Error(' Username name cannot start with space.')
    }
    if(/\s$/.test(req.body.google_username)){
        throw new Error(' Username name cannot end with space.')
    }



    user.google_username = req.body.google_username;
  }
  else if(user.fb_id){ 


    if(!req.body.fb_username){
      throw new Error('Enter your username.')
    }
    if(/^\s/.test(req.body.fb_username)){
      throw new Error('Username name cannot start with space.')
    }
    if(/\s$/.test(req.body.fb_username)){
        throw new Error('Username name cannot end with space.')
    }



    user.fb_username = req.body.fb_username;
  } else{


    if(!req.body.username){
      throw new Error('Enter your username.')
    }
    
    if(/^\s/.test(req.body.username)){
      throw new Error('Username name cannot start with space.')
    }
    if(/\s$/.test(req.body.username)){
        throw new Error('Username name cannot end with space.')
    }


    user.username = await req.body.username;
  }


  

    if(req.body.dob){
      var dob = req.body.dob.split('-');
      console.log(dob);
      // check for all under integer range then only update
      year = (dob[0] >= 1970 && dob[0] <= 2021)
      month = (dob[1] <= 12 && dob[1]>=1)
      day = (dob[2]>=1 && dob[2]<=31) 
      console.log(year, month, day)
      if(year && month && day){
        user.dob = req.body.dob;
      }
    }



    validGender = req.body.gender==='Male' || req.body.gender==='Female' || req.body.gender==='Others' || req.body.gender==='';
    if(!validGender) throw new Error('select an appropriate gender');
    user.gender = req.body.gender

    valid = req.body.profession==='Self Earning' || req.body.profession==='Student' || req.body.profession==='Others' || req.body.profession==='';
    console.log(req.body.profession)
    if(!valid) throw new Error('Select an appropriate profession');
    user.profession = req.body.profession

    if(user.role != "user"){

    if(/^\s/.test(req.body.channel)){
      throw new Error('Channel name cannot start with space.')
    }
    if(/\s$/.test(req.body.channel)){
        throw new Error('Channel name cannot end with space.')
    }

  

  }

  
    
 
  
  await user.save(()=>{
    req.user = user;
  })
  console.log("uptaded user : ", user)
  // req.flash('success', 'your account details are changed')

 
  res.redirect("/dashboard")



  } catch(e){
    console.log("error : ", e);
    req.flash('error' , e.message);
    res.redirect('/dashboard') 
  }
  
  
})



router.post("/login_old", passport.authenticate("local-user" , {
	
	failureRedirect: "/register_or_login"
}), (req, res)=>{
 
  if(req.user.role === 'admin'){
    res.redirect("/adminportal")
  } else if(req.user.role === 'auditor'){
    res.redirect("/auditorportal")
  } else{
    res.redirect("/")
  }

});







// passport.use('local.signup', new LocalStrategy({
//   usernameField:'email', //it can be email or whatever one chooses
//   passwordField:'password',
//   confirmField:'password',
//   passReqToCallback:true//here is the trick.u pass everything you want to do to a callback
//   },function (req,email, password, done) {
//      req.checkBody('email','Invalid e-mail address...').notEmpty().isEmail().normalizeEmail();//validate email
//      req.checkBody('password','Invalid password...').notEmpty().isLength({min:8});//validate pass to be min 8 chars but you can provide it with checking for capital letters and so on and so forth
//      var errors = req.validationErrors();
//      if(errors){
//      var messages = [];
//      errors.forEach(function (error) {
//      messages.push(error.msg)
//     });
//    return done(null, false, req.flash('error', messages))
//    }

// User.findOne({ email: req.body.email }, function (err, user) {

// // Make sure user doesn't already exist
//   if (user) return done(null, false, {message:'The email address you have 
//   entered is already associated with another account.'
//  });










//logout user route
router.get("/logout_old" ,(req,res)=>{
  
  // console.log("req.user",req.user);
	req.logout();
	res.send("logged you out");
});


router.get('/forgot',(req,res)=>{ 
  res.render('forgot', {message: req.flash('success')});
})

router.post('/forgot', async (req,res)=>{


  try{


    console.log("yes received : " , req.body.email)
    var token;
    crypto.randomBytes(20,(err,buf)=>{
      if(err) console.log(err)
      token = buf.toString('hex');
      console.log(token)
    })
      
    User.findOne({email: req.body.email}, async (err,user)=>{

      try{

        if(!user){
          throw new Error('Please enter correct E-mail');
        }
        user.resetPasswordToken = await token;
        user.resetPasswordExpires =  Date.now() + 3600000; //1 hr
        await user.save((err)=>{
          if(err) console.log(err)
        })
  
        var link = PROTOCOL + HOSTNAME + '/reset/' + token
          
        var mailOptions = {
          from: USER,
          to: req.body.email,
          subject: 'Request for password reset',
          html: `<h2>Hi ${req.body.email},</h2>
          <p>Need to reset your password?  </p>
          <p>No problem,  just click the button below and, you'll be on your way.</p>
          <p>The link for password reset is valid for the next one hour only.</p>
          <button style="outline:none;border:none;background-color:#5995fd;border:1px solid white;border-radius:3px;padding:7px"><a style="text-decoration:none;color:white;font-size:15px;font-family:'poppins',sans-serif" href="${link}">Reset Password</a></button>
          <p>If you did not make this request, please ignore this mail.</p><br><br>
          <p>Regards,</p>
          <p>Team Backbenchers</p> `
        }
        transport.sendMail(mailOptions,(err)=>{
          if(err) {
            throw new Error(err);
          }
          console.log('mail sent');
          req.flash('success' , 'An e-mail has been sent to ' + req.body.email + ' for password reset.');
          res.redirect('/');
        })


      } catch(err){
        req.flash('error',err.message);
        res.redirect('/forgot');
      }
      
    })


  } catch(err){
    
    req.flash('error',err.message);
    res.redirect('/forgot');

  }

  
  })



router.get('/reset/:token',(req,res)=>{
  User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } },(err,user)=>{
    if(!user){
      req.flash('error', 'Either token is invalid or expired')
      res.redirect('/forgot')
    } else{
      res.render('reset',{token: req.params.token})
    }
  })
})


router.post('/reset/:token', function(req, res) {   
  
    
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } },async function(err, user) {
    if (!user) {
      req.flash('error', 'The given link is either invalid or has expired.');
      res.redirect('/forgot');
    }

    // var validpass = validatePass(req.body.password)
    // if(validpass.status){

      if(req.body.password === req.body.confirm) {
        console.log("new password : ", req.body.password)
        user.password = await req.body.password;
        await user.save();
        await user.hashPassword()
        
        console.log("This is after hashing password", user.password);
        
      } else {
          req.flash("error", "Passwords do not match.");
          res.redirect('/forgot');
      }

    // } else {
    //   res.redirect('/reset/'+req.params.token)
    // }
    
  });
  

  req.flash('success', 'Success! Your password has been changed.');
  res.redirect("/")
  

  
});







// forgot username




router.get('/forgotUsername',(req,res)=>{ 
  res.render('forgotUsername', {message: req.flash('success')});
})

router.post('/forgotUsername', async (req,res)=>{


  try{


    console.log("yes received : " , req.body.email)
    var token;
    crypto.randomBytes(20,(err,buf)=>{
      if(err) console.log(err)
      token = buf.toString('hex');
      console.log(token)
    })
      
    User.findOne({email: req.body.email}, async (err,user)=>{

      try{

        if(!user){
          throw new Error('Please enter correct E-mail');
        }
        user.resetUsernameToken = await token;
        user.resetUsernameExpires =  Date.now() + 3600000; //1 hr
        await user.save((err)=>{
          if(err) console.log(err)
        })
  
        var link = PROTOCOL + HOSTNAME + '/resetUsername/' + token
          
        var mailOptions = {
          from: USER,
          to: req.body.email,
          subject: 'Request for Username reset',
          html: `<h2>Hi ${req.body.email},</h2>
          <p>Need to update your username ? 
          </p>

          <p>No problem,  just click the button below and, you'll be on your way. </p>

          <p>The link for updating your username is valid for the next one hour only.</p>

          <button style="outline:none;border:none;background-color:#5995fd;border:1px solid white;border-radius:3px;padding:7px"><a style="text-decoration:none;color:white;font-size:15px;font-family:'poppins',sans-serif" href="${link}">Reset Username</a></button>
          <p>If you did not make this request, please ignore this mail.</p><br><br>
          <p>Regards,</p>
          <p>Team Backbenchers</p> `
        }
        transport.sendMail(mailOptions,(err)=>{
          if(err) {
            throw new Error(err);
          }
          console.log('mail sent');
          req.flash('success' , 'An e-mail has been sent to ' + req.body.email + ' for username reset.');
          res.redirect('/');
        })


      } catch(err){
        req.flash('error',err.message);
        res.redirect('/forgot');
      }
      
    })


  } catch(err){
    
    req.flash('error',err.message);
    res.redirect('/forgot');

  }

  
  })



router.get('/resetUsername/:token',(req,res)=>{
  User.findOne({resetUsernameToken: req.params.token, resetUsernameExpires: { $gt: Date.now() } },(err,user)=>{
    if(!user){
      req.flash('error', 'Either token is invalid or expired')
      res.redirect('/forgot')
    } else{
      res.render('resetUsername',{token: req.params.token})
    }
  })
})


router.post('/resetUsername/:token', function(req, res) {   
  
    
  User.findOne({ resetUsernameToken: req.params.token, resetUsernameExpires: { $gt: Date.now() } },async function(err, user) {
    if (!user) {
      req.flash('error', 'The given link is either invalid or has expired.');
      res.redirect('/forgot');
    }

    // var validpass = validatePass(req.body.password)
    // if(validpass.status){

      
      console.log("new username : ", req.body.username)
      if(user.username){
        user.username = await req.body.username;
      } else if(user.google_username){
        user.google_username = await req.body.username;
      } else {
        user.fb_username = await req.body.username;
      }
      
      await user.save();
      

    // } else {
    //   res.redirect('/reset/'+req.params.token)
    // }
    
  });
  
  req.flash('success', 'Success! Your Username has been changed.');
  res.redirect("/")
  
  
});






















router.get("/sharepost/:slug", (req,res)=>{

    Post.findOne({slug: req.params.slug},(err,post)=>{
      if(err) console.log(err)
      else if(req.user){
        User.findById(req.user._id, (err,user)=>{
          if(err) console.log(err)
          else{
            var already = false;
            var index = 0;
            for(var i=0; i<user.shared_posts.length ; i++){
              if(post._id.equals(user.shared_posts[i].postid)){
                already = true;
                index = i;
                break;
              }
            }
            console.log("already : ",already)
            if(already){
              user.shared_posts[index].count += 1;

            } else if(!already){
              var obj = {};
              obj.postid = post._id;
              obj.count = 1;
              user.shared_posts.push(obj);
            }
            user.save((err,user)=>{
              if(err) console.log(err)
              console.log(user.shared_posts)
            });
            res.json({
              sharedpostsarray : user.shared_posts,
              message: user.username + " is logged in"
            })
          }
        })
      } else {
        console.log("no user logged in")
        res.json({message: "no user logged in"})
      }
    })
})








router.post("/profile-pic-update", check, upload.single("photo"),async (req,res)=>{
  try{
    var file = req.file;
    console.log(file)
    if(!file) throw new Error('File not attached');
    var user = await User.findById(req.user._id);
    if(!user) throw new Error('An internal error occured, try again')


    const extension = file.mimetype.split('/')[1];
    console.log(extension)
    if(extension === 'jpeg' || extension === 'png' || extension === 'jpg' || extension === 'JPEG' || extension === 'PNG' || extension === 'JPG'){
      // good
    } else {
      throw new Error('Only png, jpg, jpeg formats are allowed!')
    }



    var uid = req.user.bb_id;
    const filename = `${uid}_${file.originalname}`
    
    user.image = filename;
    await user.save();
    res.redirect("/dashboard");
  }catch(err){
    req.flash("error", err.message);
    res.redirect("/dashboard")
  }
})




router.get("/hhh", async (req,res)=>{
  res.render("login_page")
})




router.get("/registerUserValidation/:username/:email", async (req,res)=>{
  // check username and email must not be taken
  

  var message="";
  var status = 1; 

  var emailunique = await User.findOne({email: req.params.email});
  var usernameunique = await User.findOne({username: req.params.username});

  // need to check if someone makes account , there must not be any 
  // google_email or email and google_username and username in the database

  var gemailunique = await User.findOne({google_email: req.params.email});
  var gusernameunique = await User.findOne({google_username: req.params.username});




  if(emailunique){
    message = 'Email already exists.';
    status = 0; 
  }

  if(gemailunique){
    message = 'Email already exists.';
    status = 0; 
  }

  if(usernameunique){
    message = 'username already exists.';
    status = 0; 
  }

  if(gusernameunique){
    message = 'username already exists.';
    status = 0; 
  }

  if(/^\s/.test(req.params.username)){
    message = 'Your username must not start with space.'
    status = 0; 
  }

  if(/\s$/.test(req.params.username)){
      message = 'Your username must not end with space.'
      status = 0; 
  } 
  

  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/


  if (!(re.test(req.params.email))){
    message = 'Please enter a valid email address.'
    status = 0;
  }


  if (!/\S/.test(req.params.username)) {
    // Didn't find something other than a space which means it's empty
    message = 'Please provide a username'
    status = 0; 
  }


  
  if (!/\S/.test(req.params.email)) {
    // Didn't find something other than a space which means it's empty
    message = 'Please provide an email'
    status = 0; 
  }



  res.json({message: message, status: status});

  
})








// middleware for checking if user is logged in 
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/register_or_login");
}

function escapeRegex(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function validatePass(password){
  var message,status
  var counts=0
  var countu=0,countl=0,countd=0
  console.log("this is the password in validate pass function: "+password)
  if(password.length<8 || password.length>12){
    // message[h++] = 'password length must be between 8 to 12'
    console.log('password length must be between 8 to 12')
    status = 0
  }
  for(var i=0;i<password.length;i++){
    console.log("in the beginning of for loop countu is", countu, " countl is ", countl, "counts is ",counts, " countd is ",countd);
    var c = password[i]
    console.log(c, " ", c.toUpperCase(), " ", c.toLowerCase());
    
    if(c==="#" || c==="@" || c==="$"){
      counts++;
    } 
    else if(c === c.toLowerCase() && (c!="#" && c!="@" && c!="$") && !(c>='0' && c<='9')){
      countl++
      console.log("countlower inside if",countl);
    }
    else if(c>='0' && c<='9'){
      countd++;
    }
    else if(c === c.toUpperCase() && (c!="#" && c!="@" && c!="$") && !(c>='0' && c<='9')){
      countu++
      console.log("countupper inside if", countu);
    }
  }
  console.log("countd: ",countd,"countl: ",countl, "countu: ",countu,"counts: ",counts)
  if(countd === 0 || countl === 0 || countu === 0 || counts===0 ){
    
    if(countd === 0){
      // message[h++] = 'you must enter atleast one number'
      console.log('you must enter atleast one number')
    }
    if(countl === 0){
      // message[h++] = 'you must have atleast one lowercase letter in your password'
      console.log('you must have atleast one lowercase letter in your password')
    }
    if(countu === 0){
      // message[h++] = 'you must have atleast one uppercase letter '
      console.log('you must have atleast one uppercase letter ')
    }
    message = "password must be of minimum 8 and max 12 characters, must contain atleast one uppercase, one lowercase and one number and a special character"
    status = 0
  }
    
  else 
    status = 1

  return {
    message: message,
    status: status
  }
  
}






module.exports = router;

// user register
// author register
// admin register

// user login
// author login
// admin login

// user protected routes
// author protected routes
// admin protected routes