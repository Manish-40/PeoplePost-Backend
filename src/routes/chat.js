const express = require("express");
const { Chat } = require("../models/chat");
const { userauth } = require("../middlewares/auth");
const { find } = require("../models/user");
const { Group } = require("../models/group.chat");
const { formatChatTime } = require("../utils/formatedDate");
const User = require("../models/user");

const chatRouter = express.Router();

// chatRouter.get("/chat/:targetUserId", userauth, async (req, res) => {
//     const { targetUserId } = req.params;
//     // console.log("targetUserId:",targetUserId);

//     const userId = req.user._id;
//     try {
//         let chat = await Chat.findOne({
//             participants: { $all: [userId, targetUserId] },
//         }).populate({
//             path: "messages.senderId",
//             select: "firstname lastname",
//         });
//         if (!chat) {
//             chat = new Chat({
//                 participants: [userId, targetUserId],
//                 messages: [],
//             });
//             await chat.save();
//         }
//         res.json(chat);
//     }
//     catch (error) {
//         console.log(error);

//     }
// });
chatRouter.get("/chat/:targetUserId", userauth, async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const userId = req.user._id;

        let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
        }).populate("messages.senderId", "firstname lastname photourl");
        console.log("chat data", chat);

        if (!chat) {
            chat = await Chat.create({
                participants: [userId, targetUserId],
                messages: [],
            });
        }
        // const targetUser = await User.findById(targetUserId).select("firstname lastname isOnline lastSeen photourl");
        chat = chat.toObject();
        chat.messages = chat.messages.map((e) => ({
            // const obj=e.toObject();
            // obj.formattedTime = formatChatTime(.createdAt); 
            // return obj;
            ...e,
            createdAt: formatChatTime(e.createdAt)
        }))
        // chat.targetUser = {
        //     _id: targetUser._id,
        //     firstname: targetUser.firstname,
        //     lastname: targetUser.lastname,
        //     isOnline: targetUser.isOnline,
        //     lastSeen: targetUser.lastSeen,
        //     photourl:targetUser.photourl,
        // };
        // console.log(chat.messages[0].createdAt);
        res.status(200).json(chat);
    } catch (error) {
        console.error("CHAT FETCH ERROR:", error);
        res.status(500).json({ message: "Failed to fetch chat" });
    }
});
chatRouter.get("/user/:targetUserId", userauth, async (req, res) => {
    const { targetUserId } = req.params;
    if (!targetUserId) {
        return res.status(400).json({ message: "User ID required" });
    }

    const user = await User.findById(targetUserId).select("firstname lastname photourl lastSeen isOnline");
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        photourl: user.photourl,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
    });
})
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