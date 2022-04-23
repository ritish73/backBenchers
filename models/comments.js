const mongoose = require('mongoose');
var commentSchema = new mongoose.Schema({
    timestamp: Date,
    creation_time: String,
    content: String,
    writer: String,
    writer_image: String,
    post: String
});

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;   