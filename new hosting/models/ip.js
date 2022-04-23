var mongoose = require('mongoose');
var ipSchema = new mongoose.Schema({
    ip_address : String,
    count : Number
});

var Ip = mongoose.model("Ip", ipSchema);
module.exports = Ip;