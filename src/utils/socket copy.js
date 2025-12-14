
// const socket=require("socket.io");
// const crypto=require("crypto");
// const { Chat } = require("../models/chat");
// const { timeStamp } = require("console");
// const getSecretRoomId=(targetUserIds)=>{
//     return [...targetUserIds].sort();
// };

// function initializeSocketForGroup(server) {
//     const io = socket(server, {
//         cors: {
//             origin: "http://localhost:5173",
//             methods: ["GET", "POST"],
//             credentials: true,
//         },
//     });

//     io.on("connection", (socket) => {
//         socket.on("joinChatGroup", ({ firstname, userId, targetUserIds }) => {
//             const roomId=getSecretRoomId(targetUserIds);
//             console.log(userId+ " Joined Room: " + roomId);
//             socket.join(roomId);
//         });
//         socket.on("sendMessageGroup", async ({ firstname, lastname, userId, targetUserIds, text }) => {

//             try {
//                 console.log({ firstname, lastname, userId, targetUserIds, text });
//                 const roomId = getSecretRoomId(userId, ...targetUserIds);
//                 console.log(firstname + " " + text);
//                 let chat = await Chat.findOne({ participants: { $all: [userId, ...targetUserIds] } });
//                 if (!chat) {
//                     chat = new Chat({
//                         participants: [userId, ...targetUserIds],
//                         messages: [],
//                     });
//                 }
//                 chat.messages.push({
//                     senderId: userId,
//                     text,
//                 });
//                 await chat.save();
//                 io.to(roomId).emit("messageReceivedGroup", { firstname, lastname, text });
//             }
//             catch (error) {
//                 console.log(error);

//             }
//         });


//         socket.on("disconnect", () => {
//         });
//     });
// }
// module.exports=initializeSocketForGroup;