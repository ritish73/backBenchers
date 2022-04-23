var mongoose = require('mongoose');

var reviewSchema = new mongoose.Schema({
    imagename: String, 
    designation: String,
    content: String
});

var Review = mongoose.model("Review",reviewSchema);
module.exports = Review;