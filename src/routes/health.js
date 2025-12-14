const dayjs = require("dayjs");
const express = require("express");
const healthrouter = express.Router();
// 1. Import the plugins
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

// 2. Load the plugins into dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
healthrouter.get("/health", async (req, res) => {
    const istTime = dayjs().tz("Asia/Kolkata").format("DD MMM YYYY, h:mm:ss A");

    res.json({
        status: "Active",
        server: "PeoplePost Backend",
        timestamp: istTime,
    });
})

module.exports = healthrouter;