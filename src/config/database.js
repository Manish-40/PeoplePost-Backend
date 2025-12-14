const mongoose = require("mongoose");



const connectdb= async()=>{
await mongoose.connect(process.env.DB_URL);
};

module.exports=connectdb;
