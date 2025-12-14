const express = require('express');
const connectdb = require("./config/database")
const app = express();
const cookieparser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const path =require("path");
require('dotenv').config()

// We explicitly list all allowed URLs here
const allowedOrigins = [
    "http://localhost:5173",                        // Your local frontend
    "https://people-post-frontend-ltqa.vercel.app",  // Your Vercel frontend
    process.env.FRONTEND_ALLOWED_URL                // Fallback for env variable
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            // If the origin is not in our list, block it
            return callback(new Error('CORS Policy: Origin not allowed'), false);
        }
        return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true, // Crucial for cookies/tokens
}));
// ------------------------

app.options("*", cors()); // Handle preflight requests
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
