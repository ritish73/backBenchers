var express = require("express");
var router  = express.Router();
var Post = require('../models/post.js');
var User = require('../models/user.js');
const middlewareObj = require("../middleware/index");
var Trending = require('../models/trending.js');
var Popular = require('../models/popular.js');
var Recommended = require('../models/recommended.js');  
var middleware = require('../middleware/publish')
var moment = require('moment');
var multer = require('multer');
var fs = require('fs');
var path = require('path');

var storage = multer.diskStorage({
    destination: function(req,file,cb){
      cb(null,'public/uploads/data/');
    },
    filename: function(req,file,cb){
        var uid = req.user.bb_id;
        
        console.log(uid + "_" + Date.now() +"_"+ file.originalname);
        cb(null,uid + "_" + Date.now() +"_"+ file.originalname);
    }
});

  var multerFilter = (req,file,cb)=>{
    const extension = file.mimetype.split('/')[1];
    if(extension === 'pdf' || extension === 'docx'){
      cb(null,true);
    } else {
      cb("Please upload a either word or pdf",false);
    }
  };
  
var upload = multer({
    storage: storage,
    multerFilter: multerFilter
  });

router.get("/",(req,res)=>{
    res.render("publish1");

})

router.get("/publish-options",(req,res)=>{
    res.render("publish2");
})

router.get("/publish-personal-info",(req,res)=>{
    res.render("publish3"); 
})

router.post("/additional-info/written" , middleware.isLoggedIn , (req,res)=>{
    
    console.log("inside post rote of creating new post");

    var count = ()=>{
        let countTotalArticles=0;
        Post.countDocuments({}, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            countTotalArticles = result;
            next(countTotalArticles);
        }
        });
    }  

    function next(countTotalArticles){
        console.log("inside next function, post rote of creating new post");

        console.log("*******************************")
        // console.log(req);
        console.log("*******************************")
        var newpost = new Post()
        newpost.title = req.body.post.title;
        newpost.content = req.body.post.content;
        newpost.subject = req.body.post.subject;
        newpost.publish_date = middleware.convertDate().toString();
        newpost.author.id = req.user._id;
        newpost.author.username = req.user.username;
        newpost.publishDay = moment().format('dddd');
        newpost.postNumber = countTotalArticles+1;
        Post.create(newpost, function(err, post){
        if(err) console.log(err)
        else{
            console.log(post);
            User.findById(req.user._id).populate("posts").exec(function(err,user){
            if(err) console.log(err)
            else {
                console.log("user who just created post is found ");
                // console.log(user)
                user.posts.push(post);
                user.save((err,user)=>{
                if(err) console.log(err)
                else {
                    // console.log(user)    
                    res.redirect("/publish/publish-personal-info");
                }
                })  
            }
            })
        } 
        })
    }  
    count();
   
})

router.post("/additional-info/uploaded", upload.single("document") , (req,res,next)=>{
    var uid = req.user.bb_id;
    var file = req.file;
    var count = ()=>{
        let countTotalArticles=0;
        Post.countDocuments({}, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            countTotalArticles = result;
            next(countTotalArticles);
        }
        });
    }  

    function next(countTotalArticles){
        var newpost = new Post()
        newpost.title = req.body.post.title;
        newpost.content = " to be edited by auditor______________";
        newpost.subject = req.body.post.subject;
        newpost.publish_date = middleware.convertDate().toString();
        newpost.author.id = req.user._id;
        newpost.author.username = req.user.username;
        newpost.publishDay = moment().format('dddd');
        newpost.postNumber = countTotalArticles+1;
        newpost.filename = uid + "_" + Date.now() +"_"+ file.originalname;
        Post.create(newpost, function(err, post){
        if(err) console.log(err)
        else{
            console.log(post);
            User.findById(req.user._id).populate("posts").exec(function(err,user){
            if(err) console.log(err)
            else {
                console.log("user who just created post is found ");
                // console.log(user)
                user.posts.push(post);
                user.save((err,user)=>{
                if(err) console.log(err)
                else {
                    // console.log(user)    
                    res.redirect("/publish/publish-personal-info");
                }
                })  
            }
            })
        } 
        })
    }  
    count();
})

router.post("/personal-info",(req,res)=>{
    console.log(req.body);
    if(req.user){
        User.findById(req.user._id, (err,user)=>{
            if(err) console.log(err)
            else{
                user.profession = req.body.info.profession;
                user.phoneNumber = req.body.info.phoneNumber;
                user.dob = req.body.info.date;
                user.fullName = req.body.info.name;
                user.add_info = true;
                user.save((err,u)=>{
                    if(err) console.log(err)
                    else{
                        console.log(u);
                    }
                })
            }
        })
    }
    var message = "your post will be audited within 2-3 business days and you will get notified when your post is published";
    res.redirect("/?message=message");
})


router.get("/download", (req,res)=>{
    let  file = req.query.file;
    var pathoffolder = path.parse(__dirname);   
    const filepath = path.join(pathoffolder.dir,'public/uploads/data/');
    const filename = `${file}`
    console.log(filepath ,filename);
    var data = fs.readFileSync("../public/uploads/data/"+filename);
   
    // var fileshow = fs.createReadStream('./public/uploads/data/'+filename);
    // res.download(filepath, filename);
    // res.download(filepath+filename, filename, (err)=>{
    //     console.log(err);
    // });
    res.header('content-type', 'application/pdf');
    res.set('Content-Disposition', 'inline;filename='+filename+'.pdf');
    res.send(data);
})

module.exports = router;

