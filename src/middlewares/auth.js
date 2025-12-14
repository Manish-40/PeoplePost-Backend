const jwt=require("jsonwebtoken");
const User=require("../models/user")
const userauth=async(req,res,next)=>{
    try
    {
    const {token}=req.cookies;
    if(!token)
    {
        res.status(401).send("please login");
    }
    const decodedobj=await jwt.verify(token,"DEV@Tinder$790");

    const{_id}=decodedobj;

    const user=await User.findById(_id);

    if(!user)
    {
        throw new Error("user not found");
    }
    req.user=user;
    next();
}
catch(error)
{
    res.status(400).send("error"+error.message);
}
};
module.exports= 
{
    userauth,
};