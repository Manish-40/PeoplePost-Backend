const express = require('express');
const connectdb = require("./config/database")
const app = express();
const cookieparser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const path =require("path");
require('dotenv').config()
app.options("*", cors());
app.use(cors({
    origin: process.env.FRONTEND_ALLOWED_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
}));
app.use(express.json());
app.use(cookieparser());

const authrouter = require("./routes/auth");
const profilerouter = require("./routes/profile");
const requesttouter = require("./routes/request");
const userrouter = require('./routes/userrouter');
const initializeSocket = require('./utils/socket');
const chatRouter = require('./routes/chat');
const initializeSocketForGroup = require('./utils/socket copy');
const upload = require('./middlewares/uploads');
const healthrouter = require('./routes/health');


app.use("/uploads", express.static(path.join(__dirname,"uploads")));


app.use("/", authrouter);
app.use("/", profilerouter);
app.use("/", requesttouter);
app.use("/", userrouter);
app.use("/", chatRouter);
app.use("/", healthrouter);



const server = http.createServer(app);

initializeSocket(server);
connectdb().then(() => {
    console.log("database connectivity established");
    server.listen(3000, () => {
        console.log("server is successfully listening on port 3000");

    });
})
    .catch((err) => {
        console.log(err)
        console.log("database cannot be connected");
    });
