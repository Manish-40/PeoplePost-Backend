// const mongoose = require("mongoose");
// const validator = require("validator");

// const postschema = new mongoose.Schema({
//     url: {
//         type: String,
//         // validate(value) {
//         //     if (!validator.isURL(value)) {
//         //         throw new Error("invalid url" + value);
//         //     }
//         // }
//     },
//     description: {
//         type: String,
//         default: "this is a default description of post",
//     },
//     author: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "user",
//         required: true,
//     },
//     status: {
//         type: String,
//         default: "posttoall"
//     },
//     name: {
//         type: String,
//         required: true,
//     },
//     photourl: {
//         type: String,
//         default: "https://media.istockphoto.com/id/1131164548/vector/avatar-5.jpg",
//         validate(value) {
//             // Allow localhost URLs or valid URLs
//             if (!value.startsWith("http://localhost") && !validator.isURL(value, { require_protocol: true })) {
//                 throw new Error("invalid url " + value);
//             }
//         }
//     },
//     userPostViewCount:{
//         type:Number,
//         default: 0
//     },
//     viewedBy:[
//         {
//             type:mongoose.Schema.Types.ObjectId,
//             ref:"user"
//         }
//     ]
// }, { timestamps: true });

// const Usermodel = mongoose.model("post", postschema);
// module.exports = Usermodel;

const mongoose = require("mongoose");
const validator = require("validator");

const postschema = new mongoose.Schema(
  {
    url: {
      type: String,
      default: "",
      validate(value) {
        if (!value) return true; // ✅ allow text-only posts
        if (!validator.isURL(value, { require_protocol: true })) {
          throw new Error("Invalid post image URL: " + value);
        }
      },
    },

    description: {
      type: String,
      default: "this is a default description of post",
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    status: {
      type: String,
      default: "posttoall",
    },

    name: {
      type: String,
      required: true,
    },

    photourl: {
      type: String,
      default:
        "https://media.istockphoto.com/id/1131164548/vector/avatar-5.jpg",
      validate(value) {
        if (!validator.isURL(value, { require_protocol: true })) {
          throw new Error("Invalid profile photo URL: " + value);
        }
      },
    },

    userPostViewCount: {
      type: Number,
      default: 0,
    },

    viewedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("post", postschema);

