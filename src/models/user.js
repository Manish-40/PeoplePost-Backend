const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userschema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 50,
    },
    lastname: {
        type: String
    },
    emailid: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("invalid email address" + value)
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error("enter a strong password" + value);
            }
        }
    },
    age: {
        type: Number,
        min: 18,
    },
    gender: {
        type: String,
        enum: {
            values: ["male", "female", "others"],
            message: `{VALUE} is not a valid gender type`
        }
        // validate(value)
        // {
        //     if(!["male","female","others"].includes(value))
        //     {
        //         throw new Error("gender data is not valid");
        //     }
        // }
    },
    // photourl:{
    //     type:String,
    //     default:"https://media.istockphoto.com/id/1131164548/vector/avatar-5.jpg?s=612x612&w=0&k=20&c=CK49ShLJwDxE4kiroCR42kimTuuhvuo2FH5y_6aSgEo=",
    //     validate(value){
    //         if(!validator.isURL(value))
    //         {
    //             throw new Error("invalid url"+value);
    //         }
    //     }
    // },
    photourl: {
        type: String,
        default:
            "https://openseauserdata.com/files/7f16cec1cc177a7e148067006e73c02a.png",
        validate(value) {
            if (!validator.isURL(value, { require_tld: false })) {
                throw new Error("invalid url " + value);
            }
        }
    },
    about: {
        type: String,
        // default: "this is a default about of the user",
    },
    skills: {
        type: String,
    },
    userViewCount:{
        type:Number,
        default:0
    },
    viewedBy:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }],
}, {
    timestamps: true
});

userschema.methods.getJWT = async function () {
    const user = this;

    const token = await jwt.sign({ _id: user._id }, "DEV@Tinder$790", { expiresIn: "7d" });
    return token;
}

userschema.methods.validatepassword = async function (passwordinpupbyuser) {
    const user = this;
    const passwordhash = user.password;

    const ispasswordvalid = await bcrypt.compare(passwordinpupbyuser, passwordhash);
    return ispasswordvalid;

};


const Usermodel = mongoose.model("user", userschema);
module.exports = Usermodel;