const User = require('../models/user.js')
const Post = require('../models/post.js')
const Trending = require('../models/trending.js')
const Popular = require('../models/popular.js')
const Viewed = require('../models/viewed.js')
const Recommended = require('../models/recommended.js')
const Comment = require('../models/comments.js')
const { resolve } = require('path')



var showObj = {};

showObj.getRecommendedArticles = async (sub)=>{
    return new Promise((resolve)=>{

        Recommended.find({subject: sub}).populate('post').exec( (err,posts)=>{
            if(err) res.send(err);
            else{


              
              resolve(posts);
            }
          });

    })
}

showObj.getTrendingArticles = async (sub)=>{
    return new Promise((resolve)=>{
      console.log("inside trending posts fetch")

        Trending.find({subject: sub}).populate('post').exec( (err,posts)=>{
            if(err) res.send(err);
            else{
              console.log(posts);
              // console.log(posts.length);

              for(var i=0; i<posts.length; i++){
                if(!posts[i].post.isReviewedByAdmin){
                  // console.log("splicing this one", posts[i].post.title);
                  posts.splice(i,1);
                }
              }
              console.log(posts.length);
              resolve(posts);
            }
          });

    })
}

showObj.getPopularArticles = async (sub)=>{
    return new Promise((resolve)=>{

        Popular.find({subject: sub, }).populate('post').exec( (err,posts)=>{
            if(err) res.send(err);
            else{


              for(var i=0; i<posts.length; i++){
                if(!posts[i].post.isReviewedByAdmin){
                  console.log("splicing this one", posts[i].post.title);
                  posts.splice(i,1);
                }
              }


              resolve(posts);
            }
          });

    })
}



// get similar articles using content base filtering

// running python script setup

// function getKeyByValue(object, value) {
//   return Object.keys(object).find(key => object[key].content === value);
// }



// showObj.getSimilarArticles = async (theslug, subject)=>{

//   var similarArticles = []
//        // write beposts to json file
//        var filepath = './articles_json/similarArticles.json';
//        var beposts = await Post.find({ subject: subject, isReviewedByAdmin: true })
//        fs.writeFile(filepath , JSON.stringify(beposts , null , 4) ,async (err) =>{
//          if(err) console.log(err);
//          else {
//            console.log("File sucessfully written")



           
      
//       var testpost = await Post.findOne({slug: theslug})
//       var testarticleindex = beposts.length
//       console.log("size : ",testarticleindex)


//       var ind = getKeyByValue(beposts,testpost.content);
//       console.log("ind : ",ind)
//       var indobj = { testindex : ind }
//       beposts = Object.assign(indobj, beposts)

//       try{


//         let pyshell = new PythonShell('hello.py');

//         // sends a message to the Python script via stdin

//         pyshell.send(JSON.stringify(beposts));

//         pyshell.on('message', function (message) {
//           // received a message sent from the Python script (a simple "print" statement)
//           console.log("message : ");
//           console.log(message)
//           var ans = message.toString()
//           console.log(typeof(ans))

//         });

//         // end the input stream and allow the process to exit
//         pyshell.end(function (err,code,signal) {
//           if (err) throw new Error( err);
//           console.log('The exit code was: ' + code);
//           console.log('The exit signal was: ' + signal);
//           console.log('finished');
//         });


//       } catch(err){

//         console.log(err)

//       }   
//         }
//        })

      
//   }








showObj.getSimilarArticles = async (theslug, subject)=>{
    return new Promise(async (resolve)=>{

        var cmpstring = theslug;
        var beposts = await Post.find({subject: subject, isReviewedByAdmin: true})

        // const childPython = spawn('python', ['hello.py', JSON.stringify(beposts)])

        // childPython.stdout.on('data' , (data)=>{
        //   console.log(`stdout : ${data}`);
        // })

        // childPython.stderr.on('data' , (data)=>{
        //   console.log(`stderr : ${data}`)
        // })

        // childPython.on('close', (code)=>{
        //   console.log(`Child proess exited with code : ${code}`)
        // })

        var similarArticles = [];

        for(var i=0; i<beposts.length; i++){
            if(beposts[i].slug != cmpstring){
            var include = false;
            var string = beposts[i].title;
            var regex = /([a-zA-Z0-9]*)?[\s-+]?([a-zA-Z0-9]*)?[\s-+]?([a-zA-Z0-9]*)?[\s-+]?([a-zA-Z0-9]*)?[\s-+]?([a-zA-Z0-9]*)?[\s-+]?([a-zA-Z0-9]*)?[\s-+]?([a-zA-Z0-9]*)?[\s-+]?([a-zA-Z0-9]*)?/
            var ans = regex.exec(string);
            var cmp = regex.exec(cmpstring);
            // console.log(ans, cmp)     
            j=1;
            while(cmp[j] != undefined){
                for(var k=1; k<8; k++){
                if(ans[k]!=undefined){
                    // console.log("ans[k] : ", ans[k] ,", cmp[j] : ", cmp[j] );
                    if(ans[k]!='is' || ans[k]!='are' || ans[k]!='the' || ans[k]!='and' || ans[k]!='in' || ans[k]!='of'){
                    const smallre = new RegExp(('\w*' + cmp[j] + '\w*'));
                    const smallre2 = new RegExp(('\w*' + ans[k] + '\w*'))
                    var sa = smallre.test(ans[k]);
                    var sa2 = smallre2.test(cmp[j]);
                    include = (sa === true || sa2 === true)?true:false;
                    // console.log("include inside : ", include);
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
        resolve(similarArticles)

    })
}



showObj.recordViews = async (req)=>{
    return new Promise(async (resolve)=>{



        if(req.user){
    
            await User.findById(req.user._id).populate({
              path: 'viewed_posts',
              populate: {
                path: 'post'
              }
            }).exec(async (err,user)=>{
        
              if(err) console.log(err) 
              else {
                await Post.findOne({slug: req.params.slug}, async (err,post)=>{
        
                  if(err) console.log(err)
                  else {
                    var index = 0;
                    var already = false;
                    console.log(already)
                    postid = post._id;
                    console.log("this is the id of current post : ", postid,user.viewed_posts.length);
                    for(var i=0; i<user.viewed_posts.length; i++){
                      
                      if(user.viewed_posts[i].post && postid.equals(user.viewed_posts[i].post._id)){
                        console.log("jnvosdnvonsdov  : ", user.viewed_posts[i].post._id)
                        index = i;
                        already = true;
                        console.log(already);
                        break;
                      }
                    }
        
                    if(already){
                      Viewed.findOne({_id: user.viewed_posts[index]._id}, async (err,view)=>{
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
                            await post.save()
                            await view.save();
                            resolve('resolved');
                          }
                          resolve('resolved');
                        }
                      })
                  
                    }
                     else if(!already){
                       console.log("was not in his views array already")
                      var viewed = new Viewed();
                      viewed.post = post;
                      await viewed.save(async (err,viewed)=>{
                        if(err) console.log(err)
                        else{
                          await user.viewed_posts.push(viewed);
                          await user.save( async (err,thisuser)=>{
                            // console.log(util.inspect(thisuser, {depth: null}))
                            if(err) console.log(err);
                            else{
                              viewed.hitsByUser += 1;
                              console.log("user.viewed_posts[index].hitsByUser : ",viewed.hitsByUser);
                              post.views += 1;
                              console.log("user.viewed_posts[index].post.views : ",post.views);
                              console.log("user.viewed_posts[index].viewsByUser" , user.viewed_posts[index].viewsByUser)
                              if(user.viewed_posts[index].viewsByUser < 4){
                                viewed.viewsByUser += 1;
                                console.log("user.viewed_posts[index].viewsByUser : ",viewed.viewsByUser)
                                post.actualViews += 1;
                                console.log("user.viewed_posts[index].post.actualViews : ",post.actualViews)
                                await post.save()
                                await viewed.save();
                                console.log("viewed.post = post : " , viewed.post)
                                resolve('resolved');
                              }
                              resolve('resolved')
                            }
        
                          });
                        }
                      })
                    }
                  }
                })
              }
        
            })
            
             
          } else {
            Post.findOne({slug: req.params.slug},async (err,post)=>{
              if(err) console.log(err)
              else{
                post.views += 1;
                post.actualViews += 1;
                console.log("post.views : ", post.views,"\n post.actualViews : ", post.actualViews);
                await post.save();
                resolve('resolved');
              }
            })
            
          }
    })
}



showObj.getComments = async (slug)=>{




  return new Promise((resolve)=>{
  
    var comments = Comment.find({post: slug}).sort({timestamp: -1});
    resolve(comments)

  })
}



module.exports = showObj;