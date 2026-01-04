
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


const { Chat } = require("../models/chat");
const crypto = require("crypto");
const socket = require("socket.io");
const { formatChatTime } = require("./formatedDate");
const User=require("../models/user");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto.createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: process.env.FRONTEND_ALLOWED_URL || "*",
      methods: ["GET", "POST"],
      credentials: true,
      transports: ["websocket", "polling"], // important for serverless
    },
  });
const date=new Date().toString();
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    console.log("server time",date);
    socket.on("registerUser",async (_id)=>{
      socket.userId=_id;
      await User.findByIdAndUpdate(_id,{isOnline:true});
      socket.broadcast.emit("userStatus",{userId:_id,isOnline:true})
    })
    socket.on("joinChat", ({ userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      socket.join(roomId);
      console.log(`User ${userId} joined room: ${roomId}`);
    });

    socket.on("sendMessage", async ({ userId, targetUserId, text, firstname, lastname }) => {
      try {
        const roomId = getSecretRoomId(userId, targetUserId);

        let chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId] },
        });

        if (!chat) {
          chat = new Chat({ participants: [userId, targetUserId], messages: [] });
        }

        const message = { senderId: userId, text, firstname, lastname, createdAt: new Date()};
        chat.messages.push(message);
        await chat.save();
        const createdAt = formatChatTime(message.createdAt);
        io.to(roomId).emit("messageReceived", {
        firstname,
        lastname,
        text,
        createdAt: createdAt, // ✅ FORMATTED
      });
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("disconnect", async() => {
      console.log("Socket disconnected:", socket.id);
      if(socket.userId)
      {
        const lastSeen=new Date();
        // const lastSeen=formatChatTime(lastseen);
        await User.findByIdAndUpdate(socket.userId,{
          isOnline:false,
          lastSeen,
        });
        socket.broadcast.emit("userStatus",{userId:socket.userId,isOnline:false,lastSeen});
      }
    });
  });
};

module.exports = initializeSocket;
