
const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const { timeStamp } = require("console");
const getSecretRoomId = (userId, targetUserId) => {
    return crypto.createHash("sha256").update([userId, targetUserId].sort().join("_")).digest("hex");
};

const initializeSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin: process.env.FRONTEND_ALLOWED_URL,//"http://localhost:5173",
        },
    });

    io.on("connection", (socket) => {
        socket.on("joinChat", ({ firstname, userId, targetUserId }) => {
            const roomId = getSecretRoomId(userId, targetUserId);
            console.log(firstname + " Joined Room: " + roomId);
            socket.join(roomId);
        });
        socket.on("sendMessage", async ({ firstname, lastname, userId, targetUserId, text }) => {
            try {
                const roomId = getSecretRoomId(userId, targetUserId);
                console.log(firstname + " " + text);
                let chat = await Chat.findOne({ participants: { $all: [userId, targetUserId] } });
                if (!chat) {
                    chat = new Chat({
                        participants: [userId, targetUserId],
                        messages: [],
                    });
                }
                chat.messages.push({
                    senderId: userId,
                    text,
                });
                await chat.save();
                io.to(roomId).emit("messageReceived", { firstname, lastname, text });
            }
            catch (error) {
                console.log(error);

            }
        });


        socket.on("disconnect", () => {

        });
    })
}
module.exports = initializeSocket;