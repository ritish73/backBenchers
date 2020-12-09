var mongoose = require('mongoose');
var passportLocalMongoose = require("passport-local-mongoose");
var uniqueValidator = require('mongoose-unique-validator');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var userSchema = new mongoose.Schema({
  
  fb_id: String,
  fb_username: {type: String, lowercase: true, unique: true, index: true,  sparse:true, match: [/^[a-zA-Z0-9]+$/, 'is invalid']},
  fb_email: {type: String, lowercase: true, unique: true, index: true ,sparse:true, match: [/\S+@\S+\.\S+/, 'is invalid']},

  google_id: String,
  google_username: {type: String, lowercase: true, unique: true, index: true,  sparse:true, match: [/^[a-zA-Z0-9]+$/, 'is invalid']},
  google_email: {type: String, lowercase: true, unique: true, index: true ,sparse:true, match: [/\S+@\S+\.\S+/, 'is invalid']},

  bb_id: { type: Number },
  username: {type: String, lowercase: true, unique: true, index: true,  sparse:true, match: [/^[a-zA-Z0-9]+$/, 'is invalid']},
  email: {type: String, lowercase: true, unique: true, index: true ,sparse:true, match: [/\S+@\S+\.\S+/, 'is invalid']},
  
  password: { 
    type: String, 
    required: true,
    trim: true 
  },

  number_of_followers: Number,
  is_prime_member: Boolean,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  newsletterAccess: Boolean,
  profession: String,
  phoneNumber: String,
  fullName: String,
  dob: Date, 
  add_info: {
    type: Boolean,
    default: false
  },

  fb_token: {
    type: String,
  },
  tokens:[{
    token:{
      type: String,
      required: true
    }
  }],
  role:{
    type: String,
    default: "user",
    required: true,
    enum: ["user", "author", "admin", "auditor"]
  } ,
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }
  ],

  saved_for_later: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }
  ],

  liked_posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }
  ], 

  auditors_checklist : [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }
  ],

  viewed_posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Viewed"
    }
  ],

  shared_posts: [
    {
      postid: String,
      count: {type: Number, default: 0}
    }
  ]

});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(uniqueValidator, {message: 'is already taken.'});

// create a jwt token for user, we use userSchema.methods because it is specific to a user i.e an instance of User collection
userSchema.methods.generateAuthToken = async function(){
  const user = this;
  const token = jwt.sign({_id: user._id.toString()},'thisisjwtsecret');
  user.tokens = user.tokens.concat({token});
  await user.save();
  return token;
}

// hashing the password before saving it in database
userSchema.methods.hashPassword = async function(next){
  const user = this;
  const saltRounds = 8;
  bcrypt.genSalt(saltRounds, async function (err, salt) {
    if (err) {
      throw err
    } else {
      await bcrypt.hash(user.password, salt, async function(err, hash) {
        if (err) {
          throw err
        } else {
          console.log(hash)
          user.password = hash;
        }
      })
    }
  })
}


// verifying the user at the time of login , we used userScema.statics because we defined this function on the complete user model
userSchema.statics.findByCredentials = async (username, pass)=>{
  const user = await User.findOne({username: username});
  console.log("user found : ", user)
  if(!user){
    throw new Error('this user does not exist, please signup first');
  }
  console.log("pass : " , pass)
  const isMatch = await bcrypt.compare(pass, user.password); //return a boolean value
  console.log("\n user.password : ", user.password)
  // if(rehash === user.password){
  //   isMatch = 1;
  // } else {
  //   isMatch = 0;
  // }
  console.log(isMatch)
  if(!isMatch){
    throw new Error('this user\'s password did not match, try again with correct password');
  }
  console.log("user in find by creds: ", user);
  return user;
}

var User = mongoose.model("User",userSchema);
module.exports = User;


