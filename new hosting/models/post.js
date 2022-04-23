var mongoose = require('mongoose');

var passportLocalMongoose = require("passport-local-mongoose");
var uniqueValidator = require('mongoose-unique-validator');
var marked = require('marked');
var slugify = require('slugify');
// this is done for sanitizing html so that user cannot write a script in the input
const createDomPurify = require('dompurify')
const {JSDOM} = require('jsdom')
const dompurify = createDomPurify(new JSDOM().window)


var postSchema = new mongoose.Schema({
  postNumber: Number,
  title: String,
  content: String,
  subject: String, // currently we have 4 subjects so one out of 4 subjects will be stored here
  likes: {type:Number,default:0},
  shares: {type:Number,default:0},
  // likes: {
  //   id:{
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "User"
  //   }
  // },
  views: {type:Number,default:0},
  actualViews: {type:Number,default:0},
  shares: Number,
  isReviewedByAdmin: {type: Boolean, default: false},
  isReviewedByAuditor: {type: Boolean, default: false},
  filename: {type: String},
  deleted: {type: Boolean, default: false},

  comments: [ {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment"
  } ],

  author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
  },
  authorName: String,
  authorLinkedIn: String,
  publishDate:{
    type: Date
  },
  
  publishDay: String,
  slug: {
    type: String,
    required: true,
    
  },
  sanitizedHtml: {
    type: String,
    required: true
  },
  
  imagename: String                                        //2002-12-09
});
postSchema.pre('validate', function(next){
  if(this.title){
    this.slug = slugify(this.title, {lower: true, strict: true})
  }
  if(this.content){
    var content =  marked(this.content) // this will convert markdown to  html
    this.sanitizedHtml = dompurify.sanitize(content) // this gets rid of any malicious code that is in the markdown
    
  }
  next()
})
postSchema.plugin(passportLocalMongoose);
var Post = mongoose.model("Post",postSchema);
module.exports = Post;

