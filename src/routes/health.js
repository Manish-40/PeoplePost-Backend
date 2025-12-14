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

healthrouter.get("/cors-check", (req, res) => {
  res.json({
    originAllowed: [
      "http://localhost:5173",
      "https://people-post-frontend-ltqa.vercel.app",
    ],
    time: new Date().toISOString(),
  });
});


module.exports = healthrouter;