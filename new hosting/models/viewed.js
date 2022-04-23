var mongoose = require("mongoose")
var viewedSchema = new mongoose.Schema({

    hitsByUser: {type: Number, default: 0},
    viewsByUser: {type: Number, default: 0},
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }
  
});

var Viewed = mongoose.model("Viewed",viewedSchema);
module.exports = Viewed;


