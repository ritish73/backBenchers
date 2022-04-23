var express = require("express");
var router  = express.Router();
var Post = require('../models/post.js');
var User = require('../models/user.js');
const middlewareObj = require("../middleware/index");
const auth = require("../middleware/auth");
var Trending = require('../models/trending.js');
var Popular = require('../models/popular.js');
var Recommended = require('../models/recommended.js');  
var middleware = require('../middleware/publish')
var moment = require('moment');
var multer = require('multer');
var nodemailer = require('nodemailer')
const nodemailerSendgrid = require('nodemailer-sendgrid');
const {USER, PASS, HOSTNAME, PROTOCOL} = require("../config/index")
var fs = require('fs');
var path = require('path');

var storage = multer.diskStorage({
    destination: function(req,file,cb){
      cb(null,'public/uploads/data/');
    },
    filename: function(req,file,cb){
        var uid = req.user.bb_id;
        const extension = file.mimetype.split('/')[1];
        console.log(uid +"_"+ file.originalname, extension);
        cb(null,uid + "_" + file.originalname);
    }
});

  var multerFilter = (req,file,cb)=>{
    const extension = file.mimetype.split('/')[1];
    if(extension === 'pdf' || extension === 'docx' || extension === 'vnd.openxmlformats-officedocument.wordprocessingml.document'){
      cb(null,true);
    } else {
      return cb(new Error('Only .pdf .docx format allowed!'), false);
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
  



router.get("/",(req,res)=>{
    res.render("publish1");

})

router.get("/publish-options", auth, (req,res)=>{
    res.render("publish2");
})


router.get("/publish-personal-info", auth, (req,res)=>{
    res.render("publish3"); 
})

router.get("/publish-channel", auth, async (req,res)=>{
    res.render("publish4");
});

router.post("/publish-channel", auth, async (req,res)=>{
    try{
    if(req.user){
        User.findById(req.user._id, async (err,user)=>{

           

            if(err) res.send(err)
            else{

                try{

                    if(!req.body.channel) throw new Error('Enter a channel name.');
                    if(!req.body.channel.length > 10) throw new Error('Channel name must be less than 10 characters');

                if(/^\s/.test(req.body.channel)){
                    throw new Error('Channel cannot start with space.')
                }
                if(/\s$/.test(req.body.channel)){
                    throw new Error('Channel cannot end with space.')
                }


                // check unique channel 
                var userfind = await User.findOne({channel: req.body.channel});
                if(userfind) throw new Error('A user with this channel name already exists.');

                user.channel = req.body.channel;

                user.linkedin = req.body.linkedin;
                user.add_info2 = true;
                user.role = 'author';
                await user.save((err,u)=>{
                    if(err) res.send(err)
                    else{
                        console.log(u);
                    }
                })

                var message = "Your article has been submitted successfully and will be published within 3-5 business days.";
        req.flash('success', message);
        res.redirect("/");

                } catch(e){

                    console.log("error : ", e);
                    req.flash('error' , e.message);
                    res.redirect('/publish/publish-channel') 

                }

                
            }

            
            
        })
    }


} catch(e){

    console.log("error : ", e);
    req.flash('error' , e.message);
    res.redirect('/publish/publish-channel')                

}


})

router.post("/additional-info/written" , auth , async (req,res)=>{


        console.log("inside post rote of creating new post");

        var count =async ()=>{
            let countTotalArticles=0;
            Post.countDocuments({}, async function(err, result) {
            if (err) {
                res.send(err);
            } else {
                countTotalArticles = await result;
                next(countTotalArticles);
            }
            });
        }  
    
        async function next(countTotalArticles){

            try{
            console.log("inside next function, post rote of creating new post");
            console.log("*******************************")
            // console.log(req);
            console.log("*******************************")
            var newpost = new Post()
            // validate title if whitespace the send error back to refill

            if(/^\s/.test(req.body.post.title)){
                throw new Error('Heading cannot start with space.')
            }

            if(/\s$/.test(req.body.post.title)){
                throw new Error('Heading cannot end with space.')
            }
            // throw new Error(req.body.post.content.length);
            if(req.body.post.title.length > 10000){
                throw new Error('Heading  cannot Exceed 10000 characters');
            }

            const title_check = await Post.findOne({title: req.body.post.title});
            if(title_check) throw new Error('Article with same heading alreday exists');

            if(!req.body.post.title) throw new Error('Enter the heading of the article');
    
            newpost.title = req.body.post.title;

            if(req.body.post.content.length > 100000){
                throw new Error('Content must not Exceed 100000 characters');
            }

            if(/^\s/.test(req.body.post.content)){
                throw new Error('Content must not start with blank space.')
            }
    
            if(/\s$/.test(req.body.post.content)){
                throw new Error('Content must not end with blank space.')
            }

            newpost.content = req.body.post.content;
            // make sure subject is not null if null send back response with error
            if(!req.body.post.subject){
                throw new Error('Enter a subject');
            } else {
                var validSubject = req.body.post.subject==='business-economics' || req.body.post.subject==='commerce' || req.body.post.subject==='engineering' || req.body.post.subject==='personality-development';
                if(!validSubject) throw new Error('Please enter a valid subject');
            }
            
            newpost.subject = req.body.post.subject;
            // newpost.publish_date = middleware.convertDate().toString();
            newpost.publishDate = new Date();
            newpost.author = req.user;
            newpost.shares = 0
            newpost.authorLinkedIn = req.user.linkedin;
            newpost.authorName = req.user.channel;
            
            newpost.publishDay = moment().format('dddd');
            newpost.postNumber = await countTotalArticles+1;
            await newpost.save((err,savedpost)=>{
                if(err) res.send(err);
                else{
                    console.log("..................................... : " , savedpost)

                    // now check first_reviewed and send email
                    User.findById(req.user._id, async (err,userwhoposted)=>{
                        if(!userwhoposted.first_reviewed){
                            userwhoposted.first_reviewed = true;
                            // send email
                            var rec;
                            if(userwhoposted.email){
                                rec = userwhoposted.email;
                            } else if(userwhoposted.google_email){
                                rec = userwhoposted.google_email;
                            } else {
                                rec = userwhoposted.fb_email;
                            }
    
                            var mailOptions = {
                                from: USER,
                                to: rec,
                                subject: 'First article sent for review',
                                html: `<p>Dear User, <p>
                                <p>Congratulations, your article has been successfully submitted and has gone for review.</p>
    
                                <p>We aim to help you produce and promote your content in the best way possible. We want to build a community that believes in active learning and encourages education. It may take up to 72-120 hours for your article to be reviewed and published if all the set rules have been met. If any problem is faced, we will notify you about the same immediately.</p>
                                <p>Thank you for your contribution!</p>
                                
                                <p>Regards,</p>
                                <p>Team Backbenchers</p> `
                              }
                              transport.sendMail(mailOptions,(err)=>{
                                if(err) {
                                  console.log(err);
                                }
                                console.log('mail sent');
                                
                              })
    
                            userwhoposted.save()
                        }







                    });
                    
                }
            });
            User.findById(req.user._id).populate("posts").exec(async function(err,user){
                if(err) res.send(err)
                else {
                    console.log("user who just created post is found ");
                    // console.log(user)
                    user.posts.push(newpost);
                    await user.save((err,saveduser)=>{
                    if(err) res.send(err)
                    else {
                        if(user.add_info === false){
                            req.flash('success','Enter the following details to publish the article.')
                            res.redirect("/publish/publish-personal-info");
                        } else {
                            res.redirect("/");
                        }
                    }
                    })  
                }
            }) 


            }
            catch(e){

                console.log("error : ", e);
                req.flash('error' , e.message);
                res.redirect('/publish/publish-options')

            }
        }  
        count();

})

router.post("/additional-info/uploaded", auth , upload.single("document") , async (req,res,next)=>{


    try{

        if(!req.file) throw new Error('No file attached.')

    var uid = req.user.bb_id;
    var file = req.file;
    const ext = req.file.mimetype.split('/')[1];
    console.log(ext)
  
    if(ext === 'pdf' || ext === 'docx' || ext === 'vnd.openxmlformats-officedocument.wordprocessingml.document'){
        console.log("ok")
    } else {
        throw new Error('File format not supported.')
    }


    var count = async ()=>{
        let countTotalArticles=0;
        Post.countDocuments({}, function(err, result) {
        if (err) {
            res.send(err);
        } else {
            countTotalArticles = result;
            next(countTotalArticles);
        }
        });
    }  

    async function next(countTotalArticles){


        try{


        var newpost = new Post()

        if(/^\s/.test(req.body.post.title)){
            throw new Error('Your title must not start with whitespaces')
        }

        if(/\s$/.test(req.body.post.title)){
            throw new Error('Your title must not end with whitespaces')
        }

        // throw new Error(req.body.post.content.length);
        if(req.body.post.title.length > 100){
            throw new Error('Title must not Exceed 100 characters');
        }

        const title_check = await Post.findOne({title: req.body.post.title});
        if(title_check) throw new Error('Article with same heading alreday exists.');
        

        if(!req.body.post.title) throw new Error('Enter a heading');

        newpost.title = req.body.post.title;



        newpost.content = " to be edited by auditor______________";

        if(!req.body.post.subject){
            throw new Error('Please choose a subject');
        } else {
            var validSubject = req.body.post.subject==='business-economics' || req.body.post.subject==='commerce' || req.body.post.subject==='engineering' || req.body.post.subject==='personality-development';
            if(!validSubject) throw new Error('Please enter a valid subject');
        }
        newpost.subject = req.body.post.subject;
        // newpost.publish_date = middleware.convertDate().toString();
        newpost.publishDate = new Date();
        newpost.author = req.user;
        newpost.shares = 0;
        if(req.user.google_username){
            newpost.authorName = req.user.google_username;
        } else if(req.user.fb_username){
            newpost.authorName = req.user.fb_username;
        } else {
            newpost.authorName = req.user.username;
        }
        newpost.publishDay = moment().format('dddd');
        newpost.postNumber = countTotalArticles+1;
        newpost.filename = uid + "_" + file.originalname;   
        Post.create(newpost, async function(err, post){
        if(err)  res.send(err)
        else{
            console.log(post);
            User.findById(req.user._id).populate("posts").exec(function(err,user){
            if(err)  res.send(err)
            else {
                console.log("user who just created post is found ");
                // console.log(user)
                user.posts.push(post);





                
                    if(!user.first_reviewed){
                        user.first_reviewed = true;
                        // send email
                        var rec;
                        if(user.email){
                            rec = user.email;
                        } else if(user.google_email){
                            rec = user.google_email;
                        } else {
                            rec = user.fb_email;
                        }

                        var mailOptions = {
                            from: USER,
                            to: rec,
                            subject: 'First article sent for review',
                            html: `<p>Dear User, <p>
                            <p>Congratulations, your article has been successfully submitted and has gone for review.</p>

                            <p>We aim to help you produce and promote your content in the best way possible. We want to build a community that believes in active learning and encourages education. It may take up to 72-120 hours for your article to be reviewed and published if all the set rules have been met. If any problem is faced, we will notify you about the same immediately.</p>
                            <p>Thank you for your contribution!</p>
                            
                            <p>Regards,</p>
                            <p>Team Backbenchers</p> `
                          }
                          transport.sendMail(mailOptions,(err)=>{
                            if(err) {
                              console.log(err);
                            }
                            console.log('mail sent');
                          })
                    }
                user.save((err,user)=>{
                if(err)  res.send(err)
                else {
                    // console.log(user)    
                    if(user.add_info === false){
                        req.flash('success','Enter the following details to publish the article.')
                        res.redirect("/publish/publish-personal-info");
                    } else {
                        res.redirect("/dashboard");
                    }
                    
                }
                })  
            }
            })
        } 
        })
    }  
    
    catch(e){

        console.log("error : ", e);
        req.flash('error' , e.message);
        res.redirect('/publish/publish-options')

    }
    }
    count();

} catch(e){
    console.log("error : ", e);
    req.flash('error' , e.message);
    res.redirect('/publish/publish-options')
}
})

router.post("/personal-info", auth ,(req,res)=>{



    try{

        // first check that none of them is empty
        if(!req.body.info.profession) throw new Error("Enter a profession");
        if(!req.body.info.phoneNumber) throw new Error("Enter a phone number");
        if(!req.body.info.date) throw new Error("Enter a date ");
        if(!req.body.info.gender) throw new Error("Enter a gender");
        if(!req.body.info.name) throw new Error("Enter a name");

        
        if(req.user){
            User.findById(req.user._id, async (err,user)=>{


            try{

            if(err)  res.send(err)
            else{

                if(/^\s/.test(req.body.info.name)){
                    throw new Error('Your name must not start with whitespaces')
                }
    
                if(/\s$/.test(req.body.info.name)){
                    throw new Error('Your name must not end with whitespaces')
                }

                user.fullName = req.body.info.name;

                valid = req.body.info.profession==='Self Earning' || req.body.info.profession==='Student' || req.body.info.profession==='Others';
                if(!valid) throw new Error('Select an appropriate profession');

                user.profession = req.body.info.profession;

                // must contain only digit and 10 digits 
                if(/(^[0-9]*$)/.test(req.body.info.phoneNumber)){
                    // yes it is all digit now check for length 10
                    if(req.body.info.phoneNumber.length!=10){
                        throw new Error('Contact number must be exactly 10 digits long')
                    }
                } else {
                    throw new Error('Contact Number must only contain digits');
                }
                user.phoneNumber = req.body.info.phoneNumber;


                // validate dob
                
                if(req.body.info.date){
                    var dob = req.body.info.date.split('-');
                    console.log(dob);
                    // check for all under integer range then only update
                    year = (dob[0] >= 1970 && dob[0] <= 2021)
                    month = (dob[1] <= 12 && dob[1]>=1)
                    day = (dob[2]>=1 && dob[2]<=31) 
                    console.log(year, month, day)
                    if(year && month && day){
                      user.dob = req.body.info.date;
                    } else {
                        throw new Error('Kindly select a date within range');
                    }
                  }

                validGender = req.body.info.gender==='Male' || req.body.info.gender==='Female' || req.body.info.gender==='Others';
                if(!validGender) throw new Error('select a valid gender');
                user.gender = req.body.info.gender;


               
                user.add_info = true;
                // user.role = 'author';
                await user.save((err,u)=>{
                    if(err)  res.send(err)
                    else{
                        console.log(u);
                    }
                })
            }
            if(user.add_info2 === true){
                res.redirect("/");
            } else {
                res.redirect("/publish/publish-channel");
            }



            } catch(e){

                console.log("error : ", e);
                req.flash('error' , e.message);
                res.redirect('/publish/publish-personal-info')   

            }
        })
    }


    } catch(e){

        console.log("error : ", e);
        req.flash('error' , e.message);
        res.redirect('/publish/publish-personal-info')        

    }
    // var message = "your post will be audited within 2-3 business days and you will get notified when your post is published";
    // req.flash('success', message)
    
})



router.get("/download", (req,res)=>{
    let  file = req.query.file;
    // var pathoffolder = path.parse(__dirname);   
    // const filepath = path.join(pathoffolder.dir,'public/uploads/data/');
    const filename = `${file}`
    console.log(filename);
    var data = fs.readFileSync("./public/uploads/data/"+filename);
    // var fileshow = fs.createReadStream('./public/uploads/data/'+filename);
    // res.download(filepath, filename);
    // res.download(filepath+filename, filename, (err)=>{
    //     console.log(err);
    // });
    res.header('content-type', 'application/pdf');
    res.set('Content-Disposition', 'inline;filename='+filename+'.pdf');
    res.send(data);
})


router.get("/displayfile/pdf", (req,res)=>{

    let  file = req.query.file;
    var ext = file.split('.')[1];
    console.log("...........",ext)
    if(ext !== 'pdf'){
        res.send("not a pdf file")
    }
    const filepath = `./public/uploads/data/`;
    const filename = `${file}`
    console.log(filepath ,filename);
    var data = fs.readFileSync(filepath+filename);
    res.header('content-type', 'application/pdf');
    res.set('Content-Disposition', 'inline;filename='+filename+'.pdf');
    res.send(data);             
})

router.get("/displayfile/word", (req,res)=>{

    let  file = req.query.file;
    var ext = file.split('.')[1];
    console.log("...........",ext)
    if(ext !== 'docx'){
        res.send("not a word file")
    }
    const filepath = `./public/uploads/data/`;
    const filename = `${file}`
    console.log(filepath ,filename);
    var data = fs.readFileSync(filepath+filename);
    res.header('content-type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.set('Content-Disposition', 'inline;filename='+filename+'.docx');
    res.send(data);
})





module.exports = router;

