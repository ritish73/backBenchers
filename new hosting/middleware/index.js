var middlewareObj={};
var User = require('../models/user')
var Post = require('../models/post')
var Trending = require('../models/trending.js');
var Popular = require('../models/popular.js');
var Viewed = require('../models/viewed.js');
var Recommended = require('../models/recommended.js');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

middlewareObj.isAdmin = function(req,res,next){
  if(req.user.role === 'admin'){
    return next();
  }
  else{
    res.status(401).send('you are not authorized as you are not an admin')
  }
}

middlewareObj.isAuditor = function(req,res,next){
  if(req.user.role === 'auditor' || req.user.role === 'admin'){
    return next();
  }
  else{
    res.status(401).send('you are not authorized as you are not an auditor')
  }
}


// middlewareObj.isLoggedIn = function (req, res, next){
// 	if(req.isAuthenticated()){
// 		return next();
// 	}
// 	res.redirect("/register_or_login");
// }

middlewareObj.partitionTrending = async function(copyOfPosts, s, e){
  var pivot = await copyOfPosts[s].actualViews;
  // console.log(pivot)
  var i = s+1;
  var count=0;
  while(i<=e){
    if(copyOfPosts[i].actualViews >= pivot){
      count++;
    }
    i++;
  }

  var pivotindex = await s + count;
  var  temp =  await copyOfPosts[s];
  copyOfPosts[s] = await copyOfPosts[pivotindex];
  copyOfPosts[pivotindex] = await temp;

  i = s;
  var j = e;
  while(i<pivotindex && j>pivotindex){
    if(copyOfPosts[i].actualViews >= copyOfPosts[pivotindex].actualViews){
      i++;
    } else if(copyOfPosts[j].actualViews < copyOfPosts[pivotindex].actualViews){
      j--;
    } else{
      var  temp =  await copyOfPosts[i];
      copyOfPosts[i] = await copyOfPosts[j];
      copyOfPosts[j] = await temp;
      i++; j--;
    }
  }
  return await pivotindex;
}

middlewareObj.partitionPopular = function(copyOfPosts, s, e){
  var pivot = copyOfPosts[s].likes;
  console.log(pivot)
  var i = s+1;
  var count=0;
  while(i<=e){
    if(copyOfPosts[i].likes >= pivot){
      count++;
    }
    i++;
  }

  var pivotindex = s + count;
  var  temp =  copyOfPosts[s];
  copyOfPosts[s] = copyOfPosts[pivotindex];
  copyOfPosts[pivotindex] = temp;

  i = s;
  var j = e;
  while(i<pivotindex && j>pivotindex){
    if(copyOfPosts[i].likes >= copyOfPosts[pivotindex].likes){
      i++;
    } else if(copyOfPosts[j].likes < copyOfPosts[pivotindex].likes){
      j--;
    } else{
      var  temp =  copyOfPosts[i];
      copyOfPosts[i] = copyOfPosts[j];
      copyOfPosts[j] = temp;
      i++; j--;
    }
  }
  return pivotindex;
}


middlewareObj.partitionRecommended = function(copyOfPosts, s, e){
  var pivot = copyOfPosts[s].rank;
  console.log(pivot)
  var i = s+1;
  var count=0;
  while(i<=e){
    if(copyOfPosts[i].rank <= pivot){
      count++;
    }
    i++;
  }

  var pivotindex = s + count;
  var  temp =  copyOfPosts[s];
  copyOfPosts[s] = copyOfPosts[pivotindex];
  copyOfPosts[pivotindex] = temp;

  i = s;
  var j = e;
  while(i<pivotindex && j>pivotindex){
    if(copyOfPosts[i].rank <= copyOfPosts[pivotindex].rank){
      i++;
    } else if(copyOfPosts[j].rank > copyOfPosts[pivotindex].rank){
      j--;
    } else{
      var  temp =  copyOfPosts[i];
      copyOfPosts[i] = copyOfPosts[j];
      copyOfPosts[j] = temp;
      i++; j--;
    }
  }
  return pivotindex;
}



middlewareObj.quickSortRecursive = async function(copyOfPosts,si,ei,type){
  if(si>=ei){
    return;
  }
  var index=0;
  if(type ==='trending'){
    index = await middlewareObj.partitionTrending(copyOfPosts,si,ei);
    await middlewareObj.quickSortRecursive(copyOfPosts,si,index-1,'trending');
    await middlewareObj.quickSortRecursive(copyOfPosts,index+1,ei,'trending');
  } else if(type ==='popular'){
    index = await middlewareObj.partitionPopular(copyOfPosts,si,ei);
    await middlewareObj.quickSortRecursive(copyOfPosts,si,index-1,'popular');
    await middlewareObj.quickSortRecursive(copyOfPosts,index+1,ei,'popular');
  } else if(type ==='recommended'){
    index = await middlewareObj.partitionRecommended(copyOfPosts,si,ei);
    await middlewareObj.quickSortRecursive(copyOfPosts,si,index-1,'recommended');
    await middlewareObj.quickSortRecursive(copyOfPosts,index+1,ei,'recommended');
  } 
  // console.log(index)
  
}

middlewareObj.trending = async function(){
  var be=0,comm=0,eng=0,pd=0;
  await Trending.deleteMany({},async (err,posts)=>{
    if(err) res.send(err)
    else{
      // console.log("deleted posts are ", posts)
      
  await Post.find({isReviewedByAdmin: true}, async (err,posts)=>{
    if(err){
      res.send(err);
    } else {
   
      var copyOfPosts = await JSON.parse(JSON.stringify(posts));
      await middlewareObj.quickSortRecursive(copyOfPosts,0,copyOfPosts.length-1,'trending');
     
      for(var i=0;i<copyOfPosts.length;i++){

            if(copyOfPosts[i].subject === 'business-economics' && be<3){
              
              // console.log("actualViews of business-economics copyOfPosts ",i+1," are : ",copyOfPosts[i].actualViews)
              var trendingpost = new Trending();
              trendingpost.subject = copyOfPosts[i].subject;
              trendingpost.rank = i+1;
              trendingpost.actualViews = copyOfPosts[i].actualViews;
              trendingpost.post = copyOfPosts[i];
              be++;
              // console.log("be : ",be)   
              await trendingpost.save(async (err,post)=>{
                if(err){
                  console.log("error occured while saving post to trending", err);
                } else {
                  
                  // console.log("this is the post saved to trending collection", post)
                  await Trending.countDocuments({},(err,c)=>{
                    console.log("finally : ",c);
                  })
                }
              })  
            }

            if(copyOfPosts[i].subject === 'commerce' && comm<3){
            // console.log("actualViews of  commerce copyOfPosts ",i+1," are : ",copyOfPosts[i].actualViews)
            var trendingpost = new Trending();
            trendingpost.subject = copyOfPosts[i].subject;
            trendingpost.rank = i+1;
            trendingpost.actualViews = copyOfPosts[i].actualViews;
            trendingpost.post = copyOfPosts[i];
            comm++;
            // console.log("comm : ",comm)
            await trendingpost.save((err)=>{
              if(err){
                res.send(err);
              }
            })
          }

        // console.log("comm outside : ",comm)

            if(copyOfPosts[i].subject === 'engineering' && eng<3){
            // console.log("actualViews of  engineering copyOfPosts ",i+1," are : ",copyOfPosts[i].actualViews)
            var trendingpost = new Trending();
            trendingpost.subject = copyOfPosts[i].subject;
            trendingpost.rank = i+1;
            trendingpost.actualViews = copyOfPosts[i].actualViews;
            trendingpost.post = copyOfPosts[i];
            eng++;
            // console.log("eng : ",eng)
            await trendingpost.save((err)=>{
              if(err){
                res.send(err);
              } 
            })  
          }

          if(copyOfPosts[i].subject === 'personality-development' && pd<3){
            // console.log("actualViews of  personality-development copyOfPosts ",i+1," are : ",copyOfPosts[i].actualViews)
            var trendingpost = new Trending();
            trendingpost.subject = copyOfPosts[i].subject;
            trendingpost.rank = i+1;
            trendingpost.actualViews = copyOfPosts[i].actualViews;
            trendingpost.post = copyOfPosts[i];
            pd++;
            // console.log("pd : ",pd)
            await trendingpost.save((err)=>{
              if(err){
                res.send(err);
              }
            })  
          }
          
        
      }

     
    }
  })

      
    }
    
  })
      // for loop end 
   
}

middlewareObj.popular = async function(){

  var be=0,comm=0,eng=0,pd=0;
  await Popular.deleteMany({},async (err,posts)=>{
    if(err) console.log(err)
    else{
      // console.log("deleted posts are ", posts)
      
  await Post.find({isReviewedByAdmin: true}, async (err,posts)=>{
    if(err){
      console.log("error occured while sorting the Popular articles",err);
    } else {
   
      var copyOfPosts = await JSON.parse(JSON.stringify(posts));
      await middlewareObj.quickSortRecursive(copyOfPosts,0,copyOfPosts.length-1,'popular');
      // console.log("copyOfPosts of all subjects is here",copyOfPosts);
      // console.log("copyOfPosts.length",copyOfPosts.length);
      // var countBE=0,countC=0,countE=0,countPD=0;
      // for(var i=0;i<copyOfPosts.length;i++){
      //   if(copyOfPosts[i].subject === 'business-economics'){
      //     countBE++;
      //   } else if(copyOfPosts[i].subject === 'commerce'){
      //     countC++;
      //   } else if(copyOfPosts[i].subject === 'engineering') {
      //     countE++;
      //   } else if(copyOfPosts[i].subject === 'personality-development') {
      //     countPD++;
      //   }
      // }

      // console.log("countBE : ",countBE,"countC : ",countC,"countE : ",countE," countPD : ",countPD );

      
      // console.log("copyOfPosts.length again",copyOfPosts.length);
      for(var i=0;i<copyOfPosts.length;i++){
        // console.log("be  : ",be,"comm : ",comm,"eng : ",eng,"pd : ",pd)
        // Trending.countDocuments({subject: 'business-economics'},(err,c1)=>{
        //   if(err) console.log(err)
        //   else{
        //     console.log("count of documents of business economics after each push from the full trending list  :", c1);
        //     be = c1;
        //   }
        // })
        // Trending.countDocuments({subject: 'commerce'},(err,c2)=>{
        //   if(err) console.log(err)
        //   else{
        //     console.log("count of documents of commerce after each push from the full trending list  :", c2);
        //     comm = c2;
        //   }
        // })
        // Trending.countDocuments({subject: 'engineering'},(err,c3)=>{
        //   if(err) console.log(err)
        //   else{
        //     console.log("count of documents of business economics after each push from the full trending list  :", c3);
        //     eng = c3;
        //   }
        // })
        // Trending.countDocuments({subject: 'personality-development'},(err,c)=>{
        //   if(err) console.log(err)
        //   else{
        //     console.log("count of documents of personality-development after each push from the full trending list  :", c);
        //     be = c;
        //   }
        // })

        if(copyOfPosts[i].subject === 'business-economics' && be<3){
          
          // console.log("likes of business-economics copyOfPosts ",i+1," are : ",copyOfPosts[i].likes)
          var popularpost = new Popular();
          popularpost.subject = copyOfPosts[i].subject;
          popularpost.rank = i+1;
          popularpost.likes = copyOfPosts[i].likes;
          popularpost.post = copyOfPosts[i];
          be++;
          console.log("be : ",be)
          await popularpost.save((err,post)=>{

            if(err){
              console.log("error occured while saving post to popular", err);
            } else {
              // console.log("this is the post saved to popular collection", post)
              Popular.countDocuments({},(err,c)=>{
                // console.log("finally : ",c);
              })
            }
          })  
        }

        if(copyOfPosts[i].subject === 'commerce' && comm<3){
        // console.log("likes of  commerce copyOfPosts ",i+1," are : ",copyOfPosts[i].likes)
        var popularpost = new Popular();
        popularpost.subject = copyOfPosts[i].subject;
        popularpost.rank = i+1;
        popularpost.likes = copyOfPosts[i].likes;
        popularpost.post = copyOfPosts[i];
        comm++;
        console.log("comm : ",comm)
        await popularpost.save((err,post)=>{
          if(err){
            console.log("error occured while saving post to popular", err);
          } else {
            
            // console.log("this is the post saved to popular collection", post)
            }
          })  
        }

        console.log("comm outside : ",comm)

          if(copyOfPosts[i].subject === 'engineering' && eng<3){
          // console.log("likes of  engineering copyOfPosts ",i+1," are : ",copyOfPosts[i].likes)
          var popularpost = new Popular();
          popularpost.subject = copyOfPosts[i].subject;
          popularpost.rank = i+1;
          popularpost.likes = copyOfPosts[i].likes;
          popularpost.post = copyOfPosts[i];
          eng++;
          console.log("eng : ",eng)
          await popularpost.save((err,post)=>{
            if(err){
              console.log("error occured while saving post to popular", err);
            } else {
              
              // console.log("this is the post saved to popular collection", post)
            }
          })  
        }
          if(copyOfPosts[i].subject === 'personality-development' && pd<3){
            // console.log("likes of  personality-development copyOfPosts ",i+1," are : ",copyOfPosts[i].likes)
            var popularpost = new Popular();
            popularpost.subject = copyOfPosts[i].subject;
            popularpost.rank = i+1;
            popularpost.likes = copyOfPosts[i].likes;
            popularpost.post = copyOfPosts[i];
            pd++;
            console.log("pd : ",pd)
            await popularpost.save((err,post)=>{
              if(err){
                console.log("error occured while saving post to popular", err);
              } else {
                
                // console.log("this is the post saved to popular collection", post)
              }
            })  
          }  
      }
    }
  })   
    }
  })
}

middlewareObj.recommended = async  function(){
  await Recommended.find({}).populate('post').exec(async (err,posts)=>{
    // console.log(posts.length)
    // console.log(posts)
    var copyOfPosts = posts
    // console.log(".............................",copyOfPosts)
    await middlewareObj.quickSortRecursive(copyOfPosts,0,copyOfPosts.length-1,'recommended');
  

    // console.log(" copy of posts " , copyOfPosts);
    await Recommended.deleteMany({})

    

    // console.log(" copy of posts " , copyOfPosts);
    var be=0,comm=0,eng=0,pd=0;
    for(var i=0;i<copyOfPosts.length;i++){

      if(copyOfPosts[i].subject === 'business-economics' && be<3){
            
        // console.log("rank of business-economics copyOfPosts ",i+1," are : ",copyOfPosts[i].rank)
        var recommendedpost = new Recommended();
        recommendedpost.subject = copyOfPosts[i].subject;
        recommendedpost.rank = copyOfPosts[i].rank;
        recommendedpost.post = copyOfPosts[i].post;
        
        be++;
        console.log("be : ",be)
        await recommendedpost.save((err,post)=>{
          if(err){
            console.log("error occured while saving post to recommended", err);
          } else {
            // console.log("this is the post saved to recommended collection", post)
            Recommended.countDocuments({},(err,c)=>{
              console.log("finally : ",c);
            })
          }
        })  

        // console.log("recommendedpost.post be : ", recommendedpost.post)
      }


      if(copyOfPosts[i].subject === 'commerce' && comm<3){
        console.log("rank of  commerce copyOfPosts ",i+1," are : ",copyOfPosts[i].rank)
        var recommendedpost = new Recommended();
        recommendedpost.subject = copyOfPosts[i].subject;
        recommendedpost.rank = copyOfPosts[i].rank;
        recommendedpost.post = copyOfPosts[i].post;
        comm++;
        console.log("comm : ",comm)
        await recommendedpost.save((err,post)=>{
          if(err){
            console.log("error occured while saving post to recommended", err);
          } else {
            
            // console.log("this is the post saved to recommended collection", post)
          }
        })  
      }



      if(copyOfPosts[i].subject === 'engineering' && eng<3){
        console.log("rank of  engineering copyOfPosts ",i+1," are : ",copyOfPosts[i].rank)
        var recommendedpost = new Recommended();
        recommendedpost.subject = copyOfPosts[i].subject;
        recommendedpost.rank = copyOfPosts[i].rank;
        recommendedpost.post = copyOfPosts[i].post;
        eng++;
        console.log("eng : ",eng)
        await recommendedpost.save((err,post)=>{
          if(err){
            console.log("error occured while saving post to recommended", err);
          } else {
            
            // console.log("this is the post saved to recommended collection", post)
          }
        })  
      }





      if(copyOfPosts[i].subject === 'personality-development' && pd<3){
        console.log("rank of  personality-development copyOfPosts ",i+1," are : ",copyOfPosts[i].rank)
        var recommendedpost = new Recommended();
        recommendedpost.subject = copyOfPosts[i].subject;
        recommendedpost.rank = copyOfPosts[i].rank;
        recommendedpost.post = copyOfPosts[i].post;
        pd++;
        console.log("pd : ",pd)
        await recommendedpost.save((err,post)=>{
          if(err){
            console.log("error occured while saving post to recommended", err);
          } else {
            
            // console.log("this is the post saved to recommended collection", post)
          }
        })  
      }

    }

  })

}

middlewareObj.totalArticles = function(){
  Post.countDocuments({}, function(err, result) {
    if (err) {
      return err;
    } else {
      return result;
    }
  });
}





var getPostsHomePageRecommended = async (obj)=>{



  return new Promise(async (resolve)=>{

    cmp1 = 1000000,cmp2 = 1000000,cmp3 = 1000000,cmp4 = 1000000;
  // var bepopularpost={},cpopularpost={},epopularpost={},pdpopularpost={};

  await Recommended.find({}).populate("post").exec(async (err,posts)=>{
    if(err) console.log(err)
    else{

      // console.log(posts.length)
      for(var i=0; i<posts.length; i++){

        

        if(posts[i].subject === 'business-economics'){
          if(posts[i].rank < cmp1){
            obj.berecommendedpost = await posts[i];
            cmp1 = await posts[i].rank;
          }
        }

        if(posts[i].subject === 'commerce'){
          if(posts[i].rank < cmp2){
            obj.crecommendedpost = await posts[i];
            cmp2 = await posts[i].rank;
          }
        }

        if(posts[i].subject === 'engineering'){
          if(posts[i].rank < cmp3){
            obj.erecommendedpost = await posts[i];
            cmp3 = await posts[i].rank;
          }
        }

        if(posts[i].subject === 'personality-development'){
          if(posts[i].rank < cmp4){
            obj.pdrecommendedpost = await posts[i];
            cmp4 = await posts[i].rank;
          }
        }
      

      }
      // console.log(obj)
      resolve(obj);
      // console.log("inside recommended")
      // obj.bepopularpost = bepopularpost;
      // obj.cpopularpost = cpopularpost;
      // obj.epopularpost = epopularpost;
      // obj.pdpopularpost = pdpopularpost;
      // console.log("**********************************************************************************",obj)
      
    }

  })
  

  })

}

var getPostsHomePagePopular = async function (obj){

  return new Promise((resolve)=>{

    cmp1 = 1000000,cmp2 = 1000000,cmp3 = 1000000,cmp4 = 1000000;
  // var bepopularpost={},cpopularpost={},epopularpost={},pdpopularpost={};

  Popular.find({}).populate("post").exec(async (err,posts)=>{
    if(err) console.log(err)
    else{

      for(var i=0; i<posts.length; i++){

        

        if(posts[i].subject === 'business-economics'){
          if(posts[i].rank < cmp1){
            obj.bepopularpost = await posts[i];
            cmp1 = await posts[i].rank;
          }
        }

        if(posts[i].subject === 'commerce'){
          if(posts[i].rank < cmp2){
            obj.cpopularpost = await posts[i];
            cmp2 = await posts[i].rank;
          }
        }

        if(posts[i].subject === 'engineering'){
          if(posts[i].rank < cmp3){
            obj.epopularpost = await posts[i];
            cmp3 = await posts[i].rank;
          }
        }

        if(posts[i].subject === 'personality-development'){
          if(posts[i].rank < cmp4){
            obj.pdpopularpost = await posts[i];
            cmp4 = await posts[i].rank;
          }
        }

      

      }
      resolve(obj);
      // console.log("inside popular")
      // obj.bepopularpost = bepopularpost;
      // obj.cpopularpost = cpopularpost;
      // obj.epopularpost = epopularpost;
      // obj.pdpopularpost = pdpopularpost;
      // console.log("**********************************************************************************",obj)
      
    }

  })
  

  })

}


var getPostsHomePageTrending = async (obj)=>{

  return new Promise((resolve)=>{

    var cmp1 = 1000000,cmp2 = 1000000,cmp3 = 1000000,cmp4 = 1000000;
    // var betrendingpost={};
    // var ctrendingpost={};
    // var etrendingpost={};
    // var pdtrendingpost={};
    Trending.find({}).populate("post").exec(async (err,posts)=>{
      if(err) console.log(err)
      else{
        for(var i=0; i<posts.length; i++){

         

          

          if(posts[i].subject === 'business-economics'){
            if(posts[i].rank < cmp1){
              
              obj.betrendingpost = await posts[i];
              cmp1 = await posts[i].rank;
            }
          }

          if(posts[i].subject === 'commerce'){
            if(posts[i].rank < cmp2){
              obj.ctrendingpost = await posts[i];
              
              cmp2 = await posts[i].rank;
            }
          }

          if(posts[i].subject === 'engineering'){
            if(posts[i].rank < cmp3){
              obj.etrendingpost = await posts[i];
              
              cmp3 = await posts[i].rank;
            }
          }

          if(posts[i].subject === 'personality-development'){
            if(posts[i].rank < cmp4){
              obj.pdtrendingpost = await posts[i];
              
              cmp4 = await posts[i].rank;
            }
          }
        

        }
        resolve(obj);
        // console.log("inside trending")
        // console.log(betrendingpost, ctrendingpost, etrendingpost, pdtrendingpost)
        // obj.betrendingpost = betrendingpost;
        // console.log(obj);
        // obj.ctrendingpost = ctrendingpost;
        // console.log(obj);
        // obj.etrendingpost = etrendingpost;
        // console.log(obj);
        // obj.pdtrendingpost = pdtrendingpost;
        // console.log("................................................................",obj);
        
        
      }
      

    })
  })
}


middlewareObj.getPostsHomePage = async function(obj){
  await getPostsHomePageTrending(obj).then((p)=>{
    // console.log("trending" , p)
  })
  await getPostsHomePagePopular(obj).then((p)=>{
    // console.log("popular" ,p)
  })
  await getPostsHomePageRecommended(obj).then((p)=>{
    // console.log("recommended" ,p)
  })
  // console.log("betrendingpost  : .......................... : " , obj.betrendingpost)
  return obj;
  
}

middlewareObj.countUsers = async function(){
  await User.countDocuments({},(err, num)=>{
    if(err) console.log(err)
    else{
      console.log( "whhie counting : " ,typeof(num), num);
      return num;
    }
  })
}


middlewareObj.helperGoogleAuth = async function(accessToken, refreshToken, profile, done){
  
  console.log(profile)
    User.findOne({google_id: profile.id}, async (err,user)=>{
      if(err) console.log(err)
      if(user){
        // console.log("the user we already have who registered using google auth is: ")
        // console.log(user)
        return done(null,user)
      } else {
        var newuser = new User()
        newuser.google_id = profile.id
        newuser.google_email = profile.emails[0].value
        newuser.google_username = profile.name.givenName + profile.name.familyName;
        newuser.isVerified = true;
        var numberofusers = await User.countDocuments({})
        console.log("numberofusers : " ,numberofusers)
        newuser.bb_id = await numberofusers+1;
        console.log(newuser.bb_id);
        newuser.password = await bcrypt.hash('PaSs',8);
        await newuser.save((err)=>{
          if(err) {
            console.log("an error was encountered while saving the user to database who used google authentication: ");
            console.log(err)
            // console.log(err.errors.username.properties);
            // console.log(err.errors.email.properties);
            return done(err,null);      // here i want to redirect user to login page 
          }
          else{
            return done(null,newuser)
          }
        })
      }
    })
    // return done(null, profile);
}





middlewareObj.helperFacebookAuth = async (accessToken, refreshToken, profile, done)=>{

  console.log(profile)
    // asynchronous
    process.nextTick(function() {

      // find the user in the database based on their facebook id
      User.findOne( {fb_id: profile.id} , async function(err, user) {

          // if there is an error, stop everything and return that
          // ie an error connecting to the database
          if (err)
              return done(err);

          // if the user is found, then log them in
          if (user) {
              console.log("user found")
              console.log(user)
              return done(null, user); // user found, return that user
          } else {
              var numberofusers = await User.countDocuments({})
              // if there is no user found with that facebook id, create them
              var newUser  = new User();

              // set all of the facebook information in our user model
              newUser.fb_id    = profile.id; // set the users facebook id                   
              newUser.fb_token = profile.token; // we will save the token that facebook provides to the user                    
              newUser.fb_username  = profile.name.givenName + profile.name.familyName; // look at the passport user profile to see how names are returned
              newUser.fb_email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
              newUser.bb_id = await numberofusers+1;
              newUser.isVerified = true;
              newUser.password = await bcrypt.hash('PaSs',8);
              // newUser.gender = profile.gender
              // newUser.pic = profile.photos[0].value
              // save our user to the database
              await newUser.save(function(err) {
                  if (err)
                      throw err;

                  // if successful, return the new user
                  
                  return done(null, newUser);
              });
          }

      });

  })

}


middlewareObj.addFollower = async (res,req)=>{
  console.log("comeee")
  // find the author
  return new Promise(async (resolve)=>{
    User.findOne({username : req.params.authname}).populate('followers').exec(async (err,founduser)=>{
      if(err) res.send(err);
      else{
        // console.log("user.followers.length : ", founduser.followers.length , req.user._id, founduser.followers[8]._id)
        for(var i=0; i<founduser.followers.length; i++){
          // console.log(req.user._id, founduser.followers[i]._id)
          if(req.user._id.equals(founduser.followers[i]._id)){
            resolve("you have already followed this author")
            return;
          }
        }
        // push current user to its follower list
        await founduser.followers.push(req.user)
        await founduser.save();
        resolve("you are now following this author")
      }
    })

  })
  
  
}


middlewareObj.sharePost = async (req)=>{
  var post = await Post.findOne({slug: req.params.slug});
  post.shares = await post.shares + 1;
  await post.save();
  await User.findById(req.user._id).populate('shared_posts').exec(async (err,user)=>{
    if(err) res.send(err);
    else{

      for(var i=0; i<user.shared_posts.length; i++){
        console.log(post._id , user.shared_posts[i]._id)
        if(post._id.equals(user.shared_posts[i]._id)){
          console.log("already shared")
          return;
        }
      }
      await user.shared_posts.push(post)
      await user.save();
    }
  })
  
}





module.exports = middlewareObj; 