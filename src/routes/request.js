const { userauth } = require("../middlewares/auth");
const express = require("express");
const Connectionrequest = require("../models/connectionrequest");
const User = require("../models/user");
const requestrouter = express.Router();

requestrouter.post("/request/send/:status/:touserid", userauth, async (req, res) => {
    try {
        const fromuserid = req.user._id;
        const touserid = req.params.touserid;
        const status = req.params.status;

        const allowedstatus = ["ignored", "interested"];
        if (!allowedstatus.includes(status)) {
            return res.status(400).json({
                message: "invalid status type " + status
            });
        }

        const touser = await User.findById(touserid);
        if (!touser) {
            return res.status(404).json({ message: "user not found", });
        }

        const existingconnectionrequest = await Connectionrequest.findOne({
            $or: [
                { fromuserid, touserid },
                { fromuserid: touserid, touserid: fromuserid }
            ],
        });
        if (existingconnectionrequest) {
            return res.status(400).send({ message: "connection request is already exist" });
        }
        const connectionrequest = new Connectionrequest({
            fromuserid,
            touserid,
            status,
        });

        const data = await connectionrequest.save();

        res.json({
            message: req.user.firstname + " is " + status + " in " + touser.firstname,
            data,
        });
    }
    catch (error) {
        res.status(400).send("error " + error.message);
    }
});

requestrouter.post("/request/review/:status/:requestid", userauth, async (req, res) => {
    try {
        const loggedinuser = req.user;
        const { status, requestid } = req.params;

        const allowedstatus = ["accepted", "rejected"];
        if (!allowedstatus.includes(status)) {
            return res.status(400).json({ message: "status not allowed" });
        }
        const connectionrequest = await Connectionrequest.findOne({
            _id: requestid,
            touserid: loggedinuser._id,
            status: "interested",

        });
        if (!connectionrequest) {
            return res.status(404).json({ message: "connection request not found" });
        }
        connectionrequest.status = status;

        const data = await connectionrequest.save();

        res.json({ message: "connection request " + status, data });

    }
    catch (error) {
        res.status(400).send("error " + error.message);
    }
});

module.exports = requestrouter;