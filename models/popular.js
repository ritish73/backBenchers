var mongoose = require("mongoose")
var popularSchema = new mongoose.Schema({
  rank: {
    type: Number
  },
  likes: {
    type: Number
  },
  subject:{
    type: String
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post"
  }
  
});

var Popular = mongoose.model("Popular",popularSchema);
module.exports = Popular;


