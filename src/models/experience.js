const mongoose = require("mongoose");
const experienceSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",      // reference to the user
            required: true,
        },
        //SDE
        title: {
            type: String,
            required: true,
        },
        //full-time, part-time, self-employee, internship, freelance, apprentship
        employmentType: {
            type: String,
            enum: ["full time", "part time", "self employee", "internship", "freelance", "apprenticeship"],
            required: true,
        },
        company: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true
        },
        //onsite, hybrid, remote
        locationType: {
            type: String,
            enum: ["onsite", "hybrid", "remote"],
            required: true
        },
        description: {
            type: String,
            required: false,
        },
        profileHeadline: {
            type: String,
            required: false,
        },
        skills: {
            type: [String]
        },
        currentlyWorking: {
            type: Boolean,
            required: true
        },
        //2022-01
        from: {
            type: String,
            required: true
        },
        //2022-01
        to: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);
module.exports = mongoose.model("userexperience", experienceSchema);
