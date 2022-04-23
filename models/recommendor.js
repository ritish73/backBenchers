var mongoose = require('mongoose');

var recommendorSchema = new mongoose.Schema({
    // unique identification of a user
    email: String,
    // at what time he viewed this article
    timestamp: String,
    // name of the article he viewed
    post_title: String,
    // did he liked it
    liked: Boolean,
    shared: Boolean
});

var Recommendor = mongoose.model("Recommendor",recommendorSchema);
module.exports = Recommendor;

