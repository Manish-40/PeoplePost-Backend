const express = require("express");
const { userauth } = require("../middlewares/auth");
const Connectionrequest = require("../models/connectionrequest");
const User = require("../models/user")
const userrouter = express.Router();
const post =require("../models/post");
const { formatLinkedInTime }=require("../utils/formatedDate.js");

const usersafedata = "firstname lastname age gender skills about photourl";

userrouter.get("/user/requests/received", userauth, async (req, res) => {

    try {
        const loggedinuser = req.user;
        const connectionrequest = await Connectionrequest.find({
            touserid: loggedinuser._id,
            status: "interested",
        }).populate("fromuserid", usersafedata);
        // }).populate("fromuserid",["firstname","lastname"]);
        res.json({ message: "data fetched successfully", data: connectionrequest });
    }
    catch (error) {
        res.status(400).send("error " + error.message);
    }
});

userrouter.get("/user/connections", userauth, async (req, res) => {
    try {

        const loggedinuser = req.user;

        const connectionrequest = await Connectionrequest.find({
            $or: [
                { touserid: loggedinuser._id, status: "accepted" },
                { fromuserid: loggedinuser._id, status: "accepted" },
            ],
        }).populate("fromuserid", usersafedata)
            .populate("touserid", usersafedata);

        // console.log(connectionrequest);


        const data = connectionrequest.map((row) => {
            if (row.fromuserid._id.toString() === loggedinuser._id.toString()) {
                return row.touserid;
            }
            return row.fromuserid;
        });

        res.json({ data });
    }
    catch (error) {
        res.status(400).send("error " + error.messsage);
    }
});

userrouter.get("/feed", userauth, async (req, res) => {
    try {

        const loggedinuser = req.user;
        // console.log("loggedinuser",loggedinuser);
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        // limit=limit>50?50:limit;
        const skip = (page - 1) * limit;

        const connectionrequest = await Connectionrequest.find({
            $or: [
                { fromuserid: loggedinuser._id },
                { touserid: loggedinuser._id }
            ],
        }).select("fromuserid touserid");

        const hideuserfromfeed = new Set();
        connectionrequest.forEach((req) => {
            hideuserfromfeed.add(req.fromuserid.toString());
            hideuserfromfeed.add(req.touserid.toString());
        });

        const users = await User.find({
            $and: [
                { _id: { $nin: Array.from(hideuserfromfeed) } },
                { _id: { $ne: loggedinuser._id } },
            ],
        }).select(usersafedata).skip(skip).limit(limit);

        res.send(users);
        // console.log(users);
        

    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
})

userrouter.get("/user/:userid",userauth,async(req,res)=>{
  const {userid}=req.params;
  try
  {
  const userclick=await User.findOne({_id:userid}).populate("viewedBy","firstname lastname")
  // .populate("firstname lastname photourl about age gender");
//   console.log(userclick);
console.log(userclick);
  res.json(userclick)
  }
  catch(error)
  {
    console.log(error);
    
  }
})

userrouter.get("/post/user/:targetpostid",userauth,async(req,res)=>{
    const {targetpostid}=req.params;
    // console.log("targetpostid",targetpostid);
    try
    {
        const userpostclick=await post.findOne({_id: targetpostid}).populate("author","photourl firstname").lean()
        // console.log(userpostclick);
        const result ={
                ...userpostclick, createdAt: formatLinkedInTime(userpostclick.createdAt)
            }
        res.json(result)
    }
    catch(error)
    {
        console.log(error);

    }
})

module.exports = userrouter;