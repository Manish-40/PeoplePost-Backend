const { validatesignupdata } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");

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
        res.cookie("token", token, { expires: new Date(Date.now() + 8 * 3600000), });
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
            res.cookie("token", token, { expires: new Date(Date.now() + 8 * 3600000), });
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
        expires: new Date(Date.now()),
    });
    res.send("logout successful");
});

module.exports = authrouter;