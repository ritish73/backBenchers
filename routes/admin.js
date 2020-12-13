var express = require("express");
var router  = express.Router();
var Post = require('../models/post.js');
var User = require('../models/user.js');

var Trending = require('../models/trending.js');
var Popular = require('../models/popular.js');
var Recommended = require('../models/recommended.js');  
var moment = require('moment');
var locus = require('locus')
var middleware = require("../middleware/index");
const { unwatchFile } = require("fs");
const middlewareObj = require("../middleware/index");
const Ip = require("../models/ip.js");
const auth = require("../middleware/auth.js");

router.get('/adminportal', auth , middleware.isAdmin, (req,res)=>{
  var ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     (req.connection.socket ? req.connection.socket.remoteAddress : null);
     console.log(ip);
  let countTotalArticles=0;
  Post.countDocuments({}, function(err, result) {
    if (err) {
        console.log(err);
    } else {
      console.log("inside admin portal", result)
      countTotalArticles = result;
      res.render("adminportal",{totalArticles: countTotalArticles})
    }
  });

})

router.get('/auditorportal', auth, middleware.isAuditor,(req,res)=>{
  res.render('auditorportal');
})

router.get('/unreviewedposts', auth,  middleware.isAdmin, async (req,res)=>{
  let countTotalArticles=0;
  Post.countDocuments({}, async function(err, result) {
    if (err) {
       console.log(err);
    } else {
      console.log("inside admin portal", result)
      countTotalArticles = await result;
    }
  });

  Post.find({}, (err,allposts)=>{
    if(err) console.log(err)
    else{
      var auditors;
      console.log("request made to search auditors")
      User.find({role: "auditor"}, (err,auditors)=>{
        if(err) console.log(err)
        else
          console.log(auditors)
          res.render("unreviewedposts", {posts: allposts, auditors: auditors, totalArticles: countTotalArticles});
      }) 
    }
  }) 
})

router.get('/unreviewedposts_auditor',  auth, middleware.isAuditor, (req,res)=>{

  User.findById(req.user._id).populate("auditors_checklist").exec(function(err,user){
    if(err) console.log(err)
    else{
      // console.log("checklist of the auditor")
      res.render("unreviewedposts_auditor", {list: user.auditors_checklist})
    }
  })
  
})

router.get('/createusers', auth,  middleware.isAdmin , (req,res)=>{
  res.render('register_Admin')
})

router.post("/register-user-by-admin", auth,  middleware.isAdmin, async (req,res)=>{
  


  var numberofusers;
    User.countDocuments({}, async (err, num)=>{
      if(err) console.log(err)
      else{
        console.log(num)
        numberofusers = await num;
        // var validpass = validatePass(req.body.password)
        var validpass = {};
        validpass.status = 1;
        var uid = await numberofusers + 1;
        if(validpass.status){

          const myfunction = async ()=>{
            var user = new User();
            
            user.username =  req.body.username;
            user.password =  req.body.password;
            user.email =  req.body.email;
            user.bb_id =  uid;
            await user.hashPassword()
            user.save().then(async ()=>{
              console.log(user);
              res.status(200).send(user);
            }).catch((e)=>{
              console.log(e);
              res.status(400).redirect("/register_or_login?=an error occured while creating your account");
            })
          }
          myfunction();

        } else {
          console.log("user creation unsuccessful")
          res.render('register',{message: "unsuccessful registration"})
        }
      }
      
    
    })



})

router.get("/posts/:id/edit", auth, middleware.isAuditor, (req,res)=>{
  Post.findById(req.params.id, function(err, post){
		res.render("edit", {post: post});
	});
})

router.put("/posts/:id", auth , middleware.isAuditor, (req,res)=>{
  Post.findByIdAndUpdate(req.params.id, req.body.post,async (err,updatedpost)=>{
    if(err) console.log(err)
    else{
      updatedpost.title = await req.body.post.title;
      updatedpost.content = await req.body.post.content;
      updatedpost.subject = await req.body.post.subject;
      await updatedpost.save();
      // var subject = updatedpost.subject;
      return res.redirect("/unreviewedposts_auditor")
      
      // res.redirect("/posts/"+subject+"/"+req.params.id)
    }
  })
})

// delete route of a post         
router.delete("/:id", auth, middleware.isAdmin,(req,res)=>{
  // var subject;
  // var author;
  // Post.findById(req.params.id,(err,deletedpost)=>{
  //   if(err) console.log(err)
  //   else{
  //     subject = deletedpost.subject;
  //     author = deletedpost.author;
  //   }
  // })
  Post.findByIdAndRemove(req.params.id, (err,post)=>{
    if(err) console.log(err)
    else {
      res.redirect("/unreviewedposts")
    }
  })
})

router.get('/approvepostbyauditor/:slug', auth  , middleware.isAuditor , (req,res)=>{
  Post.findOne({slug: req.params.slug}, async (err,foundpost)=>{
    if(err) console.log(err)
    else{
      foundpost.isReviewedByAuditor = true;
      await foundpost.save()
      console.log("foundpost reviewed with title " + foundpost.slug , foundpost.isReviewedByAuditor)
      res.json({reviewed: true})
    }
  })
})

router.get('/approvepostbyadmin/:slug',  auth , middleware.isAuditor , (req,res)=>{
  console.log("entered the route approved post by admin")
  Post.findOne({slug: req.params.slug}, async (err,foundpost)=>{
    if(err) console.log(err)
    else{
      
      foundpost.isReviewedByAdmin = true;
      await foundpost.save((err,post)=>{
        if(err) console.log(err)
        else{
          console.log(post , " is made true by admin and saved to database")
        }
      })
      
      console.log("foundpost reviewed with title " + foundpost.slug , foundpost.isReviewedByAdmin)
      res.json({reviewed: true})
    }
  })
})

router.get("/sendToAuditor/:name/:postslug",  auth , middleware.isAuditor , (req,res)=>{
  
  console.log("request made to search auditors")
  var message='already';
  Post.findOne({slug: req.params.postslug},(err,foundpost)=>{
    if(err) console.log(err)
    else{
      console.log("foundpost is " + foundpost)
      User.findOne({username: req.params.name}).populate("auditors_checklist").exec(async function(err,auditor){
        if(err) console.log(err)
        else {
          var check = false;
          console.log("value of check before : " + check)
          for(var i=0;i<auditor.auditors_checklist.length;i++){
            if(foundpost.title === auditor.auditors_checklist[i].title){
              check = true
            }
          }
          console.log("value of check after : " + check)
          if(!check){
            await auditor.auditors_checklist.push(foundpost);
            message = "post received by "+auditor.username+ " successfully"
          } else{
            message = "post already given to " + auditor.username
          }
          
          await auditor.save((err,auditor)=>{
            if(err) console.log(err)
            else {
              console.log(auditor)
              console.log("this is th auditor to admin just sent the post for checking throung ajax request in admin.js routes folder "+auditor)
              
            }
          })
          
        }
        return res.json({message: message})
      })
    }
    
  })
  
})


router.get("/reviewedByAuditors", auth, middleware.isAuditor,(req,res)=>{
  Post.find({isReviewedByAuditor: true},(err,posts)=>{
    if(err) console.log(err)
    else{
      res.render("finalChecking",{posts: posts})
    }
  }) 
})

router.get("/clear/:slug", (req,res)=>{
  console.log("clear this post from the list ajax request reached to admin.js");

  // if(req.user.role === 'admin'){

  //   Post.find({},(err,posts)=>{
  //     if(err) console.log(err);
  //     else{
  //       Post.findOne({slug: req.params.slug}, (err,post)=>{
  //         if(err) console.log(err)
  //         else{
  //           console.log("posts.length",posts.length);
  //           for(var i=0;i<posts.length;i++){
  //             console.log("posts[i].title" ,posts[i].title,"post.title", post.title )
  //             if(posts[i].title === post.title){
  //               posts.splice(i ,1);
  //               break;
  //             }
  //           }
  //         }
  //       })
  //     }
  //   })
  // }

  if(req.user.role === 'auditor'){

    User.findById(req.user._id).populate("auditors_checklist").exec(function(err,user){

      if(err) console.log(err)
      else{
          Post.findOne({slug: req.params.slug}, async (err,post)=>{
          if(err) console.log(err)
          else{
            for(var i=0;i<user.auditors_checklist.length;i++){
              if(user.auditors_checklist[i].title === post.title){
                user.auditors_checklist.splice(i ,1);
                break;
              }
            }
            await user.save((err,user)=>{
              if(err) console.log(err)
              else{
                console.log("auditor post is deleted and user is saved again");
              }
            })
          }
        })
      }
    })
  }
})

router.get("/updateTrending", auth, middleware.isAdmin ,async (req,res)=>{
  var obj = {
  }
  await middleware.trending(func());
  
  

function func(){
  Trending.find({}).populate("post").exec((err,posts)=>{
    
    if(err){
      console.log("an error occured while finding all the posts of trending",err);
    } else {
      
      console.log("about to send res.json to client")
      obj.message = "trending function called ";
      obj.posts = posts;
      // console.log(obj)
      res.json(obj) 
    }
  })
}
})

router.get("/updatePopular", auth, middleware.isAdmin, async (req,res)=>{

  var obj = {};
  await middleware.popular(func());
  function func(){
  Popular.find({}).populate("post").exec((err,posts)=>{
    if(err){
      console.log("an error occured while finding all the posts of popular",err);
    } else {
      console.log("about to send res.json to client")
      obj.message = "popular function called ";
      obj.posts = posts;
      // console.log(obj)
      res.json(obj) 
    }
  })
  }
})


router.get("/updateRecommended",auth, middleware.isAdmin,async (req,res)=>{

  var obj = {};
  await middleware.recommended(func());
  function func(){
  Recommended.find({}).populate("post").exec((err,posts)=>{
    if(err){
      console.log("an error occured while finding all the posts of recommended",err);
    } else {
      console.log("about to send res.json to client")
      obj.message = "recommended function called ";
      obj.posts = posts;
      // console.log(obj)
      res.json(obj) 
    }
  })
  }
})


router.get('/showips',auth, middleware.isAdmin, (req,res)=>{
  Ip.find({}, (err,allips)=>{
    if(err) console.log(err)
    else{
      res.render("showips",{ips: allips});
    }
  })
})

router.post('/updateRecommended/:slug/:subject/:page',auth, middleware.isAdmin, (req,res)=>{
  var pos = req.body.position;
  if(pos<=0 || pos>10){
    res.json({message: "enter a valid position between 1 to 10"})
  } else {
    Post.findOne({slug: req.params.slug},(err,post)=>{
      if(err) console.log(err)
      else{
        Recommended.findOne({rank : pos}).exec((err,foundpost)=>{
          if(err) console.log(err)
          else{
            if(foundpost){
              console.log("*****************")
              // update the post
              foundpost.post = post;
              foundpost.subject = req.params.subject;
              foundpost.save()
            } else {
              console.log("++++++++++++++++")
              var newpost = new Recommended();
              newpost.rank = pos;
              newpost.post = post;
              newpost.subject = req.params.subject;
              newpost.save();
            }
            var sub = req.params.subject;
            var page = req.params.page;
            res.redirect("/posts/"+sub+"?page="+page);
          }
        })
      }
    })
  }
})

module.exports = router;