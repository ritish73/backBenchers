var express = require("express");
var router  = express.Router();
var Post = require('../models/post.js');
var User = require('../models/user.js');
var Contact = require('../models/contactus.js');
var Query = require('../models/query.js');
const auth = require("../middleware/auth.js");
var middleware = require("../middleware/index");
var deleteObj = require("../controllers/deleteController")
var moment = require("moment");

router.post('/submit/home', async (req,res)=>{

    try{


        if(/^\s/.test(req.body.email)){
            throw new Error('Your email must not start with whitespaces')
        }
        if(/\s$/.test(req.body.email)){
            throw new Error('Your email must not end with whitespaces')
        }
        if(!req.body.email) throw new Error('Please mention a email');
        if(!req.body.message) throw new Error('Please mention a message');
    
        if(req.body.message.length > 3000){
            throw new Error('Content must not Exceed 3000 characters');
        }
        if(/^\s/.test(req.body.message)){
            throw new Error('Your message must not start with whitespaces')
        }

        if(/\s$/.test(req.body.message)){
            throw new Error('Your message must not end with whitespaces')
        }
    
        let date=new Date();
        let hours = date.getHours()
        let mins = date.getMinutes()
        let seconds = date.getSeconds()
        var query = new Query();
        query.email = req.body.email;
        query.queryDate = date;
        query.message = req.body.message
        await query.save();
        let gooddate = date.toDateString();
        req.flash('success','your message is sent , you will get a reply on your provided email.');
        res.redirect("/");

    } catch(e){
        console.log("error : ", e.message);
        req.flash('error' , e.message);
        res.redirect('/')
    }

    

})




router.post('/submit/:subject/:page', async (req,res)=>{

    // this route will post queries in a collection and it will be shown in admin portal
    
    
    // Sunday - Saturday : 0 - 6
    // let day = date.getDay();
    // let dayofmonth = date.getDate()
    // let year = date.getFullYear();
    

    let date=new Date();
    let hours = date.getHours()
    let mins = date.getMinutes()
    let seconds = date.getSeconds()
    var query = new Query();
    query.email = req.body.email;
    query.queryDate = date;
    query.message = req.body.message
    await query.save();
    let gooddate = date.toDateString();
    req.flash('success','your message is sent , you will get a reply on your provided email.');
    res.redirect('/posts/'+req.params.subject+"?page="+req.params.page);

})







// actual route is /query/contactus


router.get('/contactus', (req,res)=>{
    
    res.render('contactus')
  })
  
  router.post('/contactusform' , async (req,res)=>{
    try{
      // username , email , phone, message
  
        


        // username checks
        if(/^\s/.test(req.body.username)){
            throw new Error('Your username must not start with whitespaces')
        }
        if(/\s$/.test(req.body.username)){
            throw new Error('Your username must not end with whitespaces')
        }
        if(!req.body.username) throw new Error('Please mention a username');
        if(req.body.username.length > 30){
            throw new Error('username must not Exceed 3000 characters');
        }





        // email checks
        if(/^\s/.test(req.body.email)){
            throw new Error('Your email must not start with whitespaces')
        }
        if(/\s$/.test(req.body.email)){
            throw new Error('Your email must not end with whitespaces')
        }
        if(!req.body.email) throw new Error('Please mention an email');
        if(req.body.email.length > 50){
            throw new Error('email must not Exceed 3000 characters');
        }





        // phone checks
        if(!req.body.phone) throw new Error("Enter a phone number");

         // must contain only digit and 10 digits 
        if(/(^[0-9]*$)/.test(req.body.phone)){
        // yes it is all digit now check for length 10
        if(req.body.phone.length!=10){
            throw new Error('Contact number must be exactly 10 digits long')
        }
        } else {
            throw new Error('Contact Number must only contain digits');
        }





        // message checks


        if(!req.body.message) throw new Error('Please mention a message');

        if(req.body.message.length > 5000){
            throw new Error('Content must not Exceed 3000 characters');
        }
        if(/^\s/.test(req.body.message)){
            throw new Error('Your message must not start with whitespaces')
        }

        if(/\s$/.test(req.body.message)){
            throw new Error('Your message must not end with whitespaces')
        }



        var newcontact = new Contact();
        newcontact.username = req.body.username;
        newcontact.email = req.body.email;
        newcontact.phone = req.body.phone;
        newcontact.message = req.body.message;
        newcontact.date = moment().format('MMMM Do YYYY, h:mm:ss a');
        await newcontact.save();

        res.redirect('/')
  
  
  
    } catch(e){

        req.flash('error',e.message)
        console.log(e)
        res.redirect('/query/contactus')
  
    }
  })





module.exports = router;