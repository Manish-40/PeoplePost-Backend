const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
      required: true,
      unique: true,       // One like document per post
    },

    // All users who liked this post
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      }
    ],

    // Like counter (auto-managed)
    likeCount: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("postlike", likeSchema);
