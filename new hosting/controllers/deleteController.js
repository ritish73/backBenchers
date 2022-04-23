
const User = require('../models/user.js')
const Post = require('../models/post.js')
var deleteObj = {};

deleteObj.deleteposteverywhere = async (res,req)=>{

    var post = await Post.findOne({slug: req.params.slug});
    // delete this post from all arrays of all users
    // grab an array containing all users
    var allusers = await User.find({});
    // run for_loop for each user and delete this post from all his arrays
    for(var us=0; us<allusers.length; us++){

        await User.updateOne({ _id: allusers[us]._id }, { $pull: { saved_for_later: post._id } },(err,user)=>{
            if(err) res.send(err) 
            else {
                console.log("user saved for later ")
            }
        })
        await User.updateOne({ _id: allusers[us]._id }, { $pull: { shared_posts: post._id } })
        await User.updateOne({ _id: allusers[us]._id }, { $pull: { liked_posts: post._id } })
        await User.updateOne({ _id: allusers[us]._id }, { $pull: { viewed_posts: post._id } })

       
    }
    return;
}

deleteObj.deleteforauthor = async(res,req)=>{
   
    // delete post from all articles array of it's author
    return new Promise(async (resolve)=>{
        var post = await Post.findOne({slug: req.params.slug});
        await User.updateOne({ username: post.authorName }, { $pull: { posts: post._id } }, (err)=>{
            if(err) {res.send(err);}
        })
        resolve()
    })
}




module.exports = deleteObj;