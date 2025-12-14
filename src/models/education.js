const mongoose = require("mongoose");
const educationSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",      // reference to the user
            required: true,
        },
        school: {
            type: String,
        },
        degree: {
            type: String,
        },
        field_of_study: {
            type: String,
        },
        grade: {
            type: String,
            required: false
        },
        description: {
            type: String,
            required: false,
        },
        skills: {
            type: [String]
        },
        from: {
            type: String,
            required: true
        },
        to: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);
module.exports = mongoose.model("usereducation", educationSchema);
