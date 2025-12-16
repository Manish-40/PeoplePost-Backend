
// const socket = require("socket.io");
// const crypto = require("crypto");
// const { Chat } = require("../models/chat");
// const { timeStamp } = require("console");
// const getSecretRoomId = (userId, targetUserId) => {
//     return crypto.createHash("sha256").update([userId, targetUserId].sort().join("_")).digest("hex");
// };

// const initializeSocket = (server) => {
//     const io = socket(server, {
//         cors: {
//             origin: process.env.FRONTEND_ALLOWED_URL,
//             methods: ["GET", "POST"],
//             credentials: true,
//         }
//     });

//     io.on("connection", (socket) => {
//         socket.on("joinChat", ({ firstname, userId, targetUserId }) => {
//             const roomId = getSecretRoomId(userId, targetUserId);
//             console.log(firstname + " Joined Room: " + roomId);
//             socket.join(roomId);
//         });
//         socket.on("sendMessage", async ({ firstname, lastname, userId, targetUserId, text }) => {
//             try {
//                 const roomId = getSecretRoomId(userId, targetUserId);
//                 console.log(firstname + " " + text);
//                 let chat = await Chat.findOne({ participants: { $all: [userId, targetUserId] } });
//                 if (!chat) {
//                     chat = new Chat({
//                         participants: [userId, targetUserId],
//                         messages: [],
//                     });
//                 }
//                 chat.messages.push({
//                     senderId: userId,
//                     text,
//                 });
//                 await chat.save();
//                 io.to(roomId).emit("messageReceived", { firstname, lastname, text });
//             }
//             catch (error) {
//                 console.log(error);

//             }
//         });


//         socket.on("disconnect", () => {

//         });
//     })
// }
// module.exports = initializeSocket;


const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");

// Generate a unique room ID for a pair of users
const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: process.env.FRONTEND_ALLOWED_URL || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Join a chat room
    socket.on("joinChat", ({ userId, targetUserId }) => {
      if (!userId || !targetUserId) return;

      const roomId = getSecretRoomId(userId, targetUserId);
      socket.join(roomId);
      console.log(`User ${userId} joined room: ${roomId}`);
    });

    // Send a chat message
    socket.on("sendMessage", async ({ userId, targetUserId, text, firstname, lastname }) => {
      try {
        if (!text) return;

        const roomId = getSecretRoomId(userId, targetUserId);

        let chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId] },
        });

        if (!chat) {
          chat = new Chat({ participants: [userId, targetUserId], messages: [] });
        }

        // Save message to database
        const messageData = { senderId: userId, text, createdAt: new Date() };
        chat.messages.push(messageData);
        await chat.save();

        // Emit message to room with firstname/lastname from client
        io.to(roomId).emit("messageReceived", { ...messageData, firstname, lastname });
      } catch (error) {
        console.error("SOCKET MESSAGE ERROR:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

module.exports = initializeSocket;


