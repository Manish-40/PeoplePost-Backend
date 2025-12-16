
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

    socket.on("joinChat", ({ userId, targetUserId }) => {
      if (!userId || !targetUserId) return;

      const roomId = getSecretRoomId(userId, targetUserId);
      socket.join(roomId);
      console.log(`User ${userId} joined room: ${roomId}`);
    });

    socket.on("sendMessage", async ({ userId, targetUserId, text }) => {
      try {
        if (!text) return;

        const roomId = getSecretRoomId(userId, targetUserId);

        let chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId] },
        });

        if (!chat) {
          chat = new Chat({ participants: [userId, targetUserId], messages: [] });
        }

        const user = await User.findById(userId).select("firstname lastname");

        const message = {
          senderId: userId,
          firstname: user.firstname,
          lastname: user.lastname,
          text,
          createdAt: new Date(),
        };

        chat.messages.push({ senderId: userId, text, createdAt: new Date() });
        await chat.save();

        io.to(roomId).emit("messageReceived", message);
      } catch (error) {
        console.error("SOCKET MESSAGE ERROR:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

module.exports.initializeSocket = initializeSocket;

