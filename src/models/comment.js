
const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",      // reference to the post
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",      // reference to the user
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("postcomment", commentSchema);
