const User = require('../models/user.js')
var dashboardObj = {};

dashboardObj.getTotalArticles = async (req)=>{
    if(req.user){
        // yes the user is authenticated
        if(req.user.role === 'author' || req.user.role === 'admin'){
            return new Promise(resolve => {

                User.findById(req.user._id).populate('posts').exec( async (err,user)=>{
                    if(err) {
                        res.send(err)
                     } else{
                        // console.log("all posts : " , user.posts)
                        resolve(user.posts)
                        
                    }
                })

            })
            
            // also calculate the total number of actual and all views of all the posts of this author
        } else {
            return 0;
        }
    } else {
        res.send('user not found in req.user')
    }
}
dashboardObj.getTotalFollowers = async(req)=>{
    if(req.user){
        if(req.user.role === 'author' || req.user.role === 'admin'){
            return new Promise( async (resolve)=>{

                await User.findById(req.user._id).populate('followers').exec( async (err,user)=>{
                    if(err) {
                        res.send(err)
                     } else{
                        console.log("all followers : " , user.followers)
                        resolve(user.followers);
                    }
                })

            })
            
            
        } else {
            return 0;
        }
    } else {
        res.send('user not found in req.user')
    }
}
dashboardObj.getTotalNumberOfLikes = async(res,req)=>{

    return new Promise((resolve)=>{

        var sum=0;
        User.findById(req.user._id).populate('posts').exec(async (err,curuser)=>{
            if(err) res.send(err);
            else{
                // console.log("curuser.posts.length : " , curuser.posts.length)
                for(var i=0; i<curuser.posts.length; i++){
                    sum += await curuser.posts[i].likes;
                }
                console.log("sum : " + sum);
                resolve(sum);
            }
        })

    })
}

dashboardObj.getSavedArticles = async (req)=>{
    return new Promise(async (resolve)=>{

        await User.findById(req.user._id).populate('saved_for_later').exec( async (err,user)=>{
            if(err) {
                res.send(err)
             } else{
                console.log("all saved_for_later : " , user.saved_for_later.length)
                resolve(user.saved_for_later);
            }
        })

    })
}


dashboardObj.getLikedArticles = async (req)=>{
    await User.findById(req.user._id).populate('liked_posts').exec( async (err,liked_posts)=>{
        if(err) {
            res.send(err)
         } else{
            console.log("all liked_posts : " , liked_posts)
            return liked_posts;
        }
    })
    
}

dashboardObj.getSharedArticles = async (req)=>{

    return new Promise(async (resolve)=>{

        await User.findById(req.user._id).populate('shared_posts').exec( async (err,user)=>{
            if(err) {
                res.send(err)
             } else{
                console.log("all shared_posts : " , user.shared_posts.length)
                resolve(user.shared_posts);
            }
        })
    })
    
    
}

module.exports = dashboardObj;