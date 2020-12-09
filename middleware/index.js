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
  if(req.isAuthenticated() && req.user.role === 'admin'){
    return next();
  }
  else{
    res.status(401).send('you are not authorized as you are not an admin')
  }
}

middlewareObj.isAuditor = function(req,res,next){
  if(req.isAuthenticated() && (req.user.role === 'auditor' || req.user.role === 'admin') ){
    return next();
  }
  else{
    res.status(401).send('you are not authorized as you are not an auditor')
  }
}

middlewareObj.isLoggedIn = function (req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/register_or_login");
}


middlewareObj.partitionTrending = function(copyOfPosts, s, e){
  var pivot = copyOfPosts[s].actualViews;
  console.log(pivot)
  var i = s+1;
  var count=0;
  while(i<=e){
    if(copyOfPosts[i].actualViews >= pivot){
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
    if(copyOfPosts[i].actualViews >= copyOfPosts[pivotindex].actualViews){
      i++;
    } else if(copyOfPosts[j].actualViews < copyOfPosts[pivotindex].actualViews){
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



middlewareObj.quickSortRecursive = function(copyOfPosts,si,ei,type){
  if(si>=ei){
    return;
  }
  var index=0;
  if(type ==='trending'){
    index = middlewareObj.partitionTrending(copyOfPosts,si,ei);
    middlewareObj.quickSortRecursive(copyOfPosts,si,index-1,'trending');
    middlewareObj.quickSortRecursive(copyOfPosts,index+1,ei,'trending');
  } else if(type ==='popular'){
    index = middlewareObj.partitionPopular(copyOfPosts,si,ei);
    middlewareObj.quickSortRecursive(copyOfPosts,si,index-1,'popular');
    middlewareObj.quickSortRecursive(copyOfPosts,index+1,ei,'popular');
  } else if(type ==='recommended'){
    index = middlewareObj.partitionRecommended(copyOfPosts,si,ei);
    middlewareObj.quickSortRecursive(copyOfPosts,si,index-1,'recommended');
    middlewareObj.quickSortRecursive(copyOfPosts,index+1,ei,'recommended');
  } 
  // console.log(index)
  
}

middlewareObj.trending = function(){
  var be=0,comm=0,eng=0,pd=0;
  Trending.deleteMany({},(err,posts)=>{
    if(err) console.log(err)
    else{
      console.log("deleted posts are ", posts)
      
  Post.find({}, (err,posts)=>{
    if(err){
      console.log("error occured while sorting the trending articles",err);
    } else {
   
      var copyOfPosts = JSON.parse(JSON.stringify(posts));
      middlewareObj.quickSortRecursive(copyOfPosts,0,copyOfPosts.length-1,'trending');
      // console.log("copyOfPosts of all subjects is here",copyOfPosts);
      console.log("copyOfPosts.length",copyOfPosts.length);
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

      
      console.log("copyOfPosts.length again",copyOfPosts.length);
      for(var i=0;i<copyOfPosts.length;i++){
        console.log("be  : ",be,"comm : ",comm,"eng : ",eng,"pd : ",pd)
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
          
          console.log("actualViews of business-economics copyOfPosts ",i+1," are : ",copyOfPosts[i].actualViews)
          var trendingpost = new Trending();
          trendingpost.subject = copyOfPosts[i].subject;
          trendingpost.rank = i+1;
          trendingpost.actualViews = copyOfPosts[i].actualViews;
          trendingpost.post = copyOfPosts[i];
          be++;
          console.log("be : ",be)   
          trendingpost.save((err,post)=>{
            if(err){
              console.log("error occured while saving post to trending", err);
            } else {
              
              console.log("this is the post saved to trending collection", post)
              Trending.count({},(err,c)=>{
                console.log("finally : ",c);
              })
            }
          })  
        }

        if(copyOfPosts[i].subject === 'commerce' && comm<3){
        console.log("actualViews of  commerce copyOfPosts ",i+1," are : ",copyOfPosts[i].actualViews)
        var trendingpost = new Trending();
        trendingpost.subject = copyOfPosts[i].subject;
        trendingpost.rank = i+1;
        trendingpost.actualViews = copyOfPosts[i].actualViews;
        trendingpost.post = copyOfPosts[i];
        comm++;
        console.log("comm : ",comm)
        trendingpost.save((err,post)=>{
          if(err){
            console.log("error occured while saving post to trending", err);
          } else {
            
            console.log("this is the post saved to trending collection", post)
            }
          })  
        }

        console.log("comm outside : ",comm)

          if(copyOfPosts[i].subject === 'engineering' && eng<3){
          console.log("actualViews of  engineering copyOfPosts ",i+1," are : ",copyOfPosts[i].actualViews)
          var trendingpost = new Trending();
          trendingpost.subject = copyOfPosts[i].subject;
          trendingpost.rank = i+1;
          trendingpost.actualViews = copyOfPosts[i].actualViews;
          trendingpost.post = copyOfPosts[i];
          eng++;
          console.log("eng : ",eng)
          trendingpost.save((err,post)=>{
            if(err){
              console.log("error occured while saving post to trending", err);
            } else {
              
              console.log("this is the post saved to trending collection", post)
            }
          })  
        }

          if(copyOfPosts[i].subject === 'personality-development' && pd<3){
            console.log("actualViews of  personality-development copyOfPosts ",i+1," are : ",copyOfPosts[i].actualViews)
            var trendingpost = new Trending();
            trendingpost.subject = copyOfPosts[i].subject;
            trendingpost.rank = i+1;
            trendingpost.actualViews = copyOfPosts[i].actualViews;
            trendingpost.post = copyOfPosts[i];
            pd++;
            console.log("pd : ",pd)
            trendingpost.save((err,post)=>{
              if(err){
                console.log("error occured while saving post to trending", err);
              } else {
                
                console.log("this is the post saved to trending collection", post)
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

middlewareObj.popular = function(){

  var be=0,comm=0,eng=0,pd=0;
  Popular.deleteMany({},(err,posts)=>{
    if(err) console.log(err)
    else{
      console.log("deleted posts are ", posts)
      
  Post.find({}, (err,posts)=>{
    if(err){
      console.log("error occured while sorting the Popular articles",err);
    } else {
   
      var copyOfPosts = JSON.parse(JSON.stringify(posts));
      middlewareObj.quickSortRecursive(copyOfPosts,0,copyOfPosts.length-1,'popular');
      // console.log("copyOfPosts of all subjects is here",copyOfPosts);
      console.log("copyOfPosts.length",copyOfPosts.length);
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

      
      console.log("copyOfPosts.length again",copyOfPosts.length);
      for(var i=0;i<copyOfPosts.length;i++){
        console.log("be  : ",be,"comm : ",comm,"eng : ",eng,"pd : ",pd)
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
          
          console.log("likes of business-economics copyOfPosts ",i+1," are : ",copyOfPosts[i].likes)
          var popularpost = new Popular();
          popularpost.subject = copyOfPosts[i].subject;
          popularpost.rank = i+1;
          popularpost.likes = copyOfPosts[i].likes;
          popularpost.post = copyOfPosts[i];
          be++;
          console.log("be : ",be)
          popularpost.save((err,post)=>{
            if(err){
              console.log("error occured while saving post to popular", err);
            } else {
              console.log("this is the post saved to popular collection", post)
              Popular.count({},(err,c)=>{
                console.log("finally : ",c);
              })
            }
          })  
        }

        if(copyOfPosts[i].subject === 'commerce' && comm<3){
        console.log("likes of  commerce copyOfPosts ",i+1," are : ",copyOfPosts[i].likes)
        var popularpost = new Popular();
        popularpost.subject = copyOfPosts[i].subject;
        popularpost.rank = i+1;
        popularpost.likes = copyOfPosts[i].likes;
        popularpost.post = copyOfPosts[i];
        comm++;
        console.log("comm : ",comm)
        popularpost.save((err,post)=>{
          if(err){
            console.log("error occured while saving post to popular", err);
          } else {
            
            console.log("this is the post saved to popular collection", post)
            }
          })  
        }

        console.log("comm outside : ",comm)

          if(copyOfPosts[i].subject === 'engineering' && eng<3){
          console.log("likes of  engineering copyOfPosts ",i+1," are : ",copyOfPosts[i].likes)
          var popularpost = new Popular();
          popularpost.subject = copyOfPosts[i].subject;
          popularpost.rank = i+1;
          popularpost.likes = copyOfPosts[i].likes;
          popularpost.post = copyOfPosts[i];
          eng++;
          console.log("eng : ",eng)
          popularpost.save((err,post)=>{
            if(err){
              console.log("error occured while saving post to popular", err);
            } else {
              
              console.log("this is the post saved to popular collection", post)
            }
          })  
        }
          if(copyOfPosts[i].subject === 'personality-development' && pd<3){
            console.log("likes of  personality-development copyOfPosts ",i+1," are : ",copyOfPosts[i].likes)
            var popularpost = new Popular();
            popularpost.subject = copyOfPosts[i].subject;
            popularpost.rank = i+1;
            popularpost.likes = copyOfPosts[i].likes;
            popularpost.post = copyOfPosts[i];
            pd++;
            console.log("pd : ",pd)
            popularpost.save((err,post)=>{
              if(err){
                console.log("error occured while saving post to popular", err);
              } else {
                
                console.log("this is the post saved to popular collection", post)
              }
            })  
          }  
      }
    }
  })   
    }
  })
}

middlewareObj.recommended = function(){

  var be=0,comm=0,eng=0,pd=0;
  Recommended.deleteMany({},(err,posts)=>{
    if(err) console.log(err)
    else{
      console.log("deleted posts are ", posts)
      
  Post.find({}, (err,posts)=>{
    if(err){
      console.log("error occured while sorting the Recommended articles",err);
    } else {
   
      var copyOfPosts = JSON.parse(JSON.stringify(posts));
      middlewareObj.quickSortRecursive(copyOfPosts,0,copyOfPosts.length-1,'recommended');

      for(var i=0;i<copyOfPosts.length;i++){
        console.log("be  : ",be,"comm : ",comm,"eng : ",eng,"pd : ",pd)
      
        if(copyOfPosts[i].subject === 'business-economics' && be<3){
          
          console.log("rank of business-economics copyOfPosts ",i+1," are : ",copyOfPosts[i].rank)
          var recommendedpost = new Recommended();
          recommendedpost.subject = copyOfPosts[i].subject;
          recommendedpost.rank = copyOfPosts[i].rank;
          recommendedpost.post = copyOfPosts[i];
          be++;
          console.log("be : ",be)
          recommendedpost.save((err,post)=>{
            if(err){
              console.log("error occured while saving post to recommended", err);
            } else {
              console.log("this is the post saved to recommended collection", post)
              Recommended.count({},(err,c)=>{
                console.log("finally : ",c);
              })
            }
          })  
        }

        if(copyOfPosts[i].subject === 'commerce' && comm<3){
        console.log("rank of  commerce copyOfPosts ",i+1," are : ",copyOfPosts[i].rank)
        var recommendedpost = new Recommended();
        recommendedpost.subject = copyOfPosts[i].subject;
        recommendedpost.rank = copyOfPosts[i].rank;
        recommendedpost.post = copyOfPosts[i];
        comm++;
        console.log("comm : ",comm)
        recommendedpost.save((err,post)=>{
          if(err){
            console.log("error occured while saving post to recommended", err);
          } else {
            
            console.log("this is the post saved to recommended collection", post)
            }
          })  
        }

        console.log("comm outside : ",comm)

          if(copyOfPosts[i].subject === 'engineering' && eng<3){
          console.log("rank of  engineering copyOfPosts ",i+1," are : ",copyOfPosts[i].rank)
          var recommendedpost = new Recommended();
          recommendedpost.subject = copyOfPosts[i].subject;
          recommendedpost.rank = copyOfPosts[i].rank;
          recommendedpost.post = copyOfPosts[i];
          eng++;
          console.log("eng : ",eng)
          recommendedpost.save((err,post)=>{
            if(err){
              console.log("error occured while saving post to recommended", err);
            } else {
              
              console.log("this is the post saved to recommended collection", post)
            }
          })  
        }
          if(copyOfPosts[i].subject === 'personality-development' && pd<3){
            console.log("rank of  personality-development copyOfPosts ",i+1," are : ",copyOfPosts[i].rank)
            var recommendedpost = new Recommended();
            recommendedpost.subject = copyOfPosts[i].subject;
            recommendedpost.rank = copyOfPosts[i].rank;
            recommendedpost.post = copyOfPosts[i];
            pd++;
            console.log("pd : ",pd)
            recommendedpost.save((err,post)=>{
              if(err){
                console.log("error occured while saving post to recommended", err);
              } else {
                
                console.log("this is the post saved to recommended collection", post)
              }
            })  
          }  
      }
    }
  })   
    }
  })
}

middlewareObj.totalArticles = function(){
  Post.count({}, function(err, result) {
    if (err) {
      return err;
    } else {
      return result;
    }
  });
}

middlewareObj.getSimilarArticles = function(cmpstring , beposts , similarArticles){
  for(var i=0; i<beposts.length; i++){
    if(beposts[i].slug != cmpstring){
      var include = false;
      var string = beposts[i].title;
      var regex = /([a-zA-Z0-9]*)?[\s-+]?([a-zA-Z0-9]*)?[\s-+]?([a-zA-Z0-9]*)?[\s-+]?([a-zA-Z0-9]*)?[\s-+]?([a-zA-Z0-9]*)?[\s-+]?([a-zA-Z0-9]*)?[\s-+]?([a-zA-Z0-9]*)?[\s-+]?([a-zA-Z0-9]*)?/
      var ans = regex.exec(string);
      var cmp = regex.exec(cmpstring);     
      j=1;
      while(cmp[j] != undefined){
        for(var k=1; k<8; k++){
          if(ans[k]!=undefined){
            console.log("ans[k] : ", ans[k] ,", cmp[j] : ", cmp[j] );
            if(ans[k]!='is' || ans[k]!='are' || ans[k]!='the' || ans[k]!='and' || ans[k]!='in' || ans[k]!='of'){
              const smallre = new RegExp(('\w*' + cmp[j] + '\w*'));
              const smallre2 = new RegExp(('\w*' + ans[k] + '\w*'))
              var sa = smallre.test(ans[k]);
              var sa2 = smallre2.test(cmp[j]);
              include = (sa === true || sa2 === true)?true:false;
              console.log("include inside : ", include);
              if(include === true){
                similarArticles.push(beposts[i]);
              }
            }
          }
        }
        j++;
      }
      
    }
  }
  return similarArticles;
}



 middlewareObj.calculateViewes = function (theuser, theslug, res, findSimilar){

  if(theuser){
  
    User.findById(theuser._id).populate({
      path: 'viewed_posts',
      populate: {
        path: 'post',
        model: 'Post'
      }
    }).exec((err,user)=>{

      if(err) console.log(err) 
      else {
        Post.findOne({slug: theslug},(err,post)=>{

          if(err) console.log(err)
          else {
            var index = 0;
            var already = false;
            console.log(already)
            postid = post._id;
            console.log("this is the id of current post : ", postid);
            for(var i=0; i<user.viewed_posts.length; i++){
              if(postid.equals(user.viewed_posts[i].post._id)){
                console.log("jnvosdnvonsdo  v  : ", user.viewed_posts[i].post._id)
                index = i;
                already = true;
                console.log(already);
                break;
              }
            }

            if(already){
              Viewed.findOne({_id: user.viewed_posts[index]._id},(err,view)=>{
                if(err) console.log(err)
                else{

                  view.hitsByUser += 1;
                  console.log("user.viewed_posts[index].hitsByUser : ",view.hitsByUser)
                  post.views += 1;
                  console.log("user.viewed_posts[index].post.views : ",post.views)
                  if(user.viewed_posts[index].viewsByUser < 4){
                    view.viewsByUser += 1;
                    console.log("user.viewed_posts[index].viewsByUser : ",view.viewsByUser)
                    post.actualViews += 1;
                    console.log("user.viewed_posts[index].post.actualViews : ",post.actualViews)
                    
                  }
                  post.save()
                  view.save();
                  
                }
              })
          
            }
             else if(!already){
              var viewed = new Viewed();
              viewed.post = post;
              viewed.viewsByUser = 0;
              viewed.hitsByUser = 0;

              viewed.save((err,viewed)=>{
                if(err) console.log(err)
                else{
                  user.viewed_posts.push(viewed);
                  user.save((err,thisuser)=>{
                    // console.log(util.inspect(thisuser, {depth: null}))
                    if(err) console.log(err);
                    else{
                      viewed.hitsByUser += 1;
                      console.log("user.viewed_posts[index].hitsByUser : ",viewed.hitsByUser);
                      post.views += 1;
                      console.log("user.viewed_posts[index].post.views : ",post.views);
                      if(viewed.viewsByUser < 4){
                        viewed.viewsByUser += 1;
                        console.log("user.viewed_posts[index].viewsByUser : ",viewed.viewsByUser)
                        post.actualViews += 1;
                        console.log("user.viewed_posts[index].post.actualViews : ",post.actualViews)
                        
                      }
                      post.save()
                      viewed.save();
                    }

                  });
                }
              })
            }
          }
          res.render("show", {post: post});
        })
      }

    })
     
  } else {
    Post.findOne({slug: theslug},(err,post)=>{
      if(err) console.log(err)
      else{
        post.views += 1;
        post.actualViews += 1;
        console.log("post.views : ", post.views,"\n post.actualViews : ", post.actualViews);
        post.save();
      }
      res.render("show", {post: post});
    })
  }

  middlewareObj.findSimilar(theslug);
}

middlewareObj.findSimilar = function(theslug){
  var cmpstring = theslug;
  var similarArticles = [];
  Post.find({subject: "business-economics"},(err,beposts)=>{
    if(err) console.log(err);
    else{
      similarArticles = [];
      similarArticles = middlewareObj.getSimilarArticles(cmpstring , beposts , similarArticles);
      console.log("similararticles : ", similarArticles);
    }
  })
}




async function calculateObj(obj){

  return new Promise((resolve)=>{

    var cmp1 = 1000000,cmp2 = 1000000,cmp3 = 1000000,cmp4 = 1000000;
    // var betrendingpost={};
    // var ctrendingpost={};
    // var etrendingpost={};
    // var pdtrendingpost={};
    Trending.find({}).populate("post").exec((err,posts)=>{
      if(err) console.log(err)
      else{
        for(var i=0; i<posts.length; i++){

          if(posts[i].subject === 'business-economics'){
            if(posts[i].rank < cmp1){
              
              obj.betrendingpost = posts[i];
              cmp1 = posts[i].rank;
            }
          }

          if(posts[i].subject === 'commerce'){
            if(posts[i].rank < cmp2){
              obj.ctrendingpost = posts[i];
              
              cmp2 = posts[i].rank;
            }
          }

          if(posts[i].subject === 'engineering'){
            if(posts[i].rank < cmp3){
              obj.etrendingpost = posts[i];
              
              cmp3 = posts[i].rank;
            }
          }

          if(posts[i].subject === 'personality-development'){
            if(posts[i].rank < cmp4){
              obj.pdtrendingpost = posts[i];
              
              cmp4 = posts[i].rank;
            }
          }

        }
        console.log("inside trending")
        // console.log(betrendingpost, ctrendingpost, etrendingpost, pdtrendingpost)
        // obj.betrendingpost = betrendingpost;
        // console.log(obj);
        // obj.ctrendingpost = ctrendingpost;
        // console.log(obj);
        // obj.etrendingpost = etrendingpost;
        // console.log(obj);
        // obj.pdtrendingpost = pdtrendingpost;
        // console.log("................................................................",obj);
        resolve(obj);
      }
      

    })

    

  })
}



var getPostsHomePagePopular = async function (obj){

  return new Promise((resolve)=>{

    cmp1 = 1000000,cmp2 = 1000000,cmp3 = 1000000,cmp4 = 1000000;
  // var bepopularpost={},cpopularpost={},epopularpost={},pdpopularpost={};

  Popular.find({}).populate("post").exec((err,posts)=>{
    if(err) console.log(err)
    else{

      for(var i=0; i<posts.length; i++){

        if(posts[i].subject === 'business-economics'){
          if(posts[i].rank < cmp1){
            obj.bepopularpost = posts[i];
            cmp1 = posts[i].rank;
          }
        }

        if(posts[i].subject === 'commerce'){
          if(posts[i].rank < cmp2){
            obj.cpopularpost = posts[i];
            cmp2 = posts[i].rank;
          }
        }

        if(posts[i].subject === 'engineering'){
          if(posts[i].rank < cmp3){
            obj.epopularpost = posts[i];
            cmp3 = posts[i].rank;
          }
        }

        if(posts[i].subject === 'personality-development'){
          if(posts[i].rank < cmp4){
            obj.pdpopularpost = posts[i];
            cmp4 = posts[i].rank;
          }
        }

      }
      console.log("inside popular")
      // obj.bepopularpost = bepopularpost;
      // obj.cpopularpost = cpopularpost;
      // obj.epopularpost = epopularpost;
      // obj.pdpopularpost = pdpopularpost;
      // console.log("**********************************************************************************",obj)
      resolve(obj);
    }

  })
  

  })

}


var getPostsHomePageTrending = async function (obj, callback){

  await calculateObj(obj).then((obj)=>{
    console.log("the object returned by trending is" )
  });

  await callback(obj).then((obj)=>{
    console.log("the object returned by popular is" )
  });

}

middlewareObj.getPostsHomePage = async function(obj){
  await getPostsHomePageTrending(obj, getPostsHomePagePopular);
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
        console.log("the user we already have who registered using google auth is: ")
        console.log(user)
        return done(null,user)
      } else {
        var newuser = new User()
        newuser.google_id = profile.id
        newuser.google_email = profile.emails[0].value
        newuser.google_username = profile.name.givenName + profile.name.familyName;
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







module.exports = middlewareObj; 