const jwt = require('jsonwebtoken');
const User = require('../models/user.js')
const check = async (req,res,next)=>{

    try{
        // console.log("req.user.fb_id : ",req.user.fb_id, "\nreq.user.google_id : ",req.user.google_id)
        if(req.user){

            if(req.user.fb_id || req.user.google_id){
                if(req.isAuthenticated()){
                    res.locals.currentUser = await req.user;
                    next();
                } else{
                    console.log("authentication failed from google or facebook")
                }
            }

        }
        else {
            // console.log("in auth middleware try block and these are req.cookies : " + JSON.stringify(req.cookies));
            if(!req.cookies.bearer_token) {
                next();
            } else {
                const token = req.cookies.bearer_token;
                console.log("bearer_token : " , token);
                const decoded = await jwt.verify(token, 'thisisjwtsecret');
                console.log(decoded, decoded._id)
                const user = await User.findOne({_id  : decoded._id, 'tokens.token': token}, async (err,founduser)=>{
                    if(err) console.log(err);
                    else{
                        await console.log("user is found : " ,founduser);
                    }
                });
                if(!user){
                    next();
                } else {

                    req.user = await user;
                    res.locals.currentUser = await req.user;
                    req.token = await token;
                    console.log("req.user before " , req.user, user)
                    next();
                }

            }
            
        }
    }catch(e){
        console.log("in auth catch")
        res.redirect('/register_or_login')
        // res.status(401).send({error: "please authenticate with correct creds"})
    }

}

module.exports = check;