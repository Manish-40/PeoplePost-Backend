const { validatesignupdata } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const validator =require("validator");

const express = require("express");

const authrouter = express.Router();

authrouter.post("/signup", async (req, res) => {
    try {
        //validation of data
        validatesignupdata(req);

        const { firstname, lastname, emailid, password, } = req.body;
        //encrypt the password
        const passwordhash = await bcrypt.hash(password, 10);
        console.log(passwordhash);


        //creating a new instance of the user model
        const user = new User({
            firstname,
            lastname,
            emailid,
            password: passwordhash,
            // age,
            // gender,
        });
        const saveduser = await user.save();
        const token = await saveduser.getJWT();

        //add the token to cookie and send the response back to the user
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,       // REQUIRED on Vercel
            sameSite: "none",   // REQUIRED for cross-origin
            expires: new Date(Date.now() + 8 * 3600000),
        });
        res.json({ message: "user Added successfully", data: saveduser });
    }
    catch (err) {
        res.status(400).send("error " + err.message);

    }
});

authrouter.post("/login", async (req, res) => {
    try {
        const { emailid, password } = req.body;

        const user = await User.findOne({ emailid: emailid });

        if (!user) {
            throw new Error("invalid credentials");
        }
        const ispasswordvalid = await user.validatepassword(password);
        if (ispasswordvalid) {
            // create a jwt token

            const token = await user.getJWT();


            //add the token to cookie and send the response back to the user
            res.cookie("token", token, {
                httpOnly: true,
                secure: true,       // REQUIRED on Vercel
                sameSite: "none",   // REQUIRED for cross-origin
                expires: new Date(Date.now() + 8 * 3600000),
            });
            res.send(user);
        }
        else {
            throw new Error("invalid credentials");
        }
    }
    catch (error) {
        res.status(400).send("error " + error.message);
    }
});

authrouter.post("/logout", async (req, res) => {
    res.cookie("token", null, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(Date.now()),
    });
    res.send("logout successful");
});

authrouter.patch("/user/forgotPassword", async (req, res) => {
    try {
        const { emailid, newPassword } = req.body;

        // 1. Validation
        if (!emailid && !newPassword) {
            return res.status(400).json({ message: "Email and new password are required" });
        }
        if(!emailid)
        {
            return res.status(400).json({message:"Email is required"});
        }
        if(!newPassword)
        {
            return res.status(400).json({message:"Password is required"});
        }
        

        if (!validator.isStrongPassword(newPassword)) {
            return res.status(400).json({
                message: "Password must be strong (uppercase, lowercase, number, symbol)"
            });
        }

        //encrypt the password
        const newpasswordhash = await bcrypt.hash(newPassword, 10);
        console.log(newpasswordhash);
        const data = await User.findOneAndUpdate({ emailid }, { password: newpasswordhash }, { new: true });
        // 4. User not found
        if (!data) {
            return res.status(404).json({
                message: "User with this email does not exist"
            });
        }
        res.status(200).json(data);
    }
    catch (error) {
        console.log(error);
    }
})

module.exports = authrouter;