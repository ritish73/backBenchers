var mongoose = require("mongoose")
var contactusSchema = new mongoose.Schema({
  
	date:{
    type: String
  },
	username:{
    type: String
  },
  email:{
    type: String
  },
  message:{
    type: String
  },
  phone:{
    type: String
  }
  
});

var Contact = mongoose.model("Contact",contactusSchema);
module.exports = Contact;









