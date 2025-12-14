const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
    groupName: {
        type: String,
        required: true
    },
    groupMessages: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'chat'
    }
})


const Group = mongoose.model("group", groupSchema);
module.exports = { Group };