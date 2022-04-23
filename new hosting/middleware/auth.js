const jwt = require('jsonwebtoken');
const User = require('../models/user.js')
const moment = require("moment");
const auth = async (req,res,next)=>{
    try{

        
        // console.log("req.user : " + req.user)
        // console.log("req.user.fb_id : ",req.user.fb_id, "\nreq.user.google_id : ",req.user.google_id)
        if(req.user && req.user.deleted === false){

            if(req.user.fb_id || req.user.google_id){
                if(req.isAuthenticated()){
                    const user = await User.findById(req.user._id)
                    if(!user) throw new Error('No user found')
                    user.last_seen = moment().format('MMMM Do YYYY, h:mm:ss a');
                    await user.save();
                    next();
                } else{
                    console.log("authentication failed from google or facebook")
                }
            }

        }
        else {
        // console.log("in auth middleware try block and these are req.cookies : " + JSON.stringify(req.cookies));
        const token = req.cookies.bearer_token;
        // console.log("bearer_token : " , token);
        if(!token) throw new Error('Login to perform this action.')           
        if(token){

        
            const decoded = jwt.verify(token, 'thisisjwtsecret');
            // console.log(decoded, decoded._id)
            const user = await User.findOne({_id  : decoded._id, 'tokens.token': token}, async (err,founduser)=>{
                if(err) console.log(err);
                else{
                    // await console.log("user is found : " ,founduser);
                }
            });
            
            if(!user){
                throw new Error('User was not found with jwt token in the cookie.');
            }
            if(!user.isVerified){
                // req.flash('error','Please verify your account via email.');
                throw new Error('Please verify your account via email.');
                
            }
            if(user && user.deleted === true){
                throw new Error('Account deleted successfully.We are sorry to see you go!');
            }
            req.user = await user;
            res.locals.currentUser = await req.user;
            req.token = await token;
            user.last_seen = moment().format('MMMM Do YYYY, h:mm:ss a');
            await user.save()
            // console.log("req.user before " , req.user, user)
            next();
        }
    }
    }catch(e){
        req.flash('error', e.message);
        console.log(e.message);
        // req.flash('error',e);
        res.redirect('/register_or_login')
        // res.status(401).send({error: "please authenticate with correct creds"})
    }
    
}


module.exports = auth;



// check expiry date of jwt
// isExpired: (token) => {
//     if (token && jwt.decode(token)) {
//       const expiry = jwt.decode(token).exp;
//       const now = new Date();
//       return now.getTime() > expiry * 1000;
//     }
//     return false;