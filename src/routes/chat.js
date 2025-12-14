const express = require("express");
const { Chat } = require("../models/chat");
const { userauth } = require("../middlewares/auth");
const { find } = require("../models/user");
const { Group } = require("../models/group.chat");

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userauth, async (req, res) => {
    const { targetUserId } = req.params;
    // console.log("targetUserId:",targetUserId);
    
    const userId = req.user._id;
    try {
        let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
        }).populate({
            path: "messages.senderId",
            select: "firstname lastname",
        });
        if (!chat) {
            chat = new Chat({
                participants: [userId, targetUserId],
                messages: [],
            });
            await chat.save();
        }
        res.json(chat);
    }
    catch (error) {
        console.log(error);

    }
});

chatRouter.post("/group", userauth, async (req, res) => {
    const { targetUserIds, groupName } = req.body;
    const userId = req.user._id;
    const allparticipants = [userId, ...targetUserIds];
    // console.log(allparticipants);
    try {
        let group = await Group.findOne({
            groupName
        });

        // console.log("group: ", group);
        if (!group) {

            const chat = new Chat({
                participants: allparticipants,
                messages: [],
            });
            await chat.save();
            // console.log("chat: ", chat);

            group = new Group({
                groupMessages: chat._id,
                groupName
            });
            await group.save();
        }

        res.status(200).json({
            message: "Group created successfully",
            data: group
        });
    }
    catch (error) {
        console.log(error);
    }
});

chatRouter.get("/group", userauth, async (req, res) => {
    const userId = req.user._id;
    try {
        const groups = await Group.find()
            .populate({
                path: "groupMessages",
                match: { participants: userId }, // only chats where this user is in participants
                populate: { path: "participants", select: "firstname lastname" }
            });

        if (!groups) {
            return res.status(200).json({
                message: "You are not in any of the group",
                data: null
            });
        }
        return res.status(200).json({
            message: "groups found successfully.",
            data: groups
        });
    }
    catch (error) {
        console.log(error);
    }
});


module.exports = chatRouter;