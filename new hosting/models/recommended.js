var mongoose = require("mongoose")
var recommendedSchema = new mongoose.Schema({
  rank: {
    type: Number
  },
  post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    },
  subject:{
    type: String
  }
  
});

var Recommended = mongoose.model("Recommended",recommendedSchema);
module.exports = Recommended;









