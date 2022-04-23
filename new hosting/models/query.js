var mongoose = require("mongoose")
var querySchema = new mongoose.Schema({
  
  email:{
    type: String
  },
  message:{
    type: String
  },
  queryDate:{
    type: Date
  }
  
});

var Query = mongoose.model("Query",querySchema);
module.exports = Query;









