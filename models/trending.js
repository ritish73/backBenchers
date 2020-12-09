var mongoose = require("mongoose")
var trendingSchema = new mongoose.Schema({
  rank: {
    type: Number
  },
  views:{
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

var Trending = mongoose.model("Trending",trendingSchema);
module.exports = Trending;


