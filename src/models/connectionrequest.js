const mongoose = require("mongoose");

const connectionrequestschema = new mongoose.Schema({

    fromuserid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    touserid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ["ignored", "interested", "accepted", "rejected"],
            message: `{VALUE} is incorrect status type`
        }
    }

},
    { timestamps: true, }
);

connectionrequestschema.pre("save", function (next) {

    const connectionrequest = this;

    if (connectionrequest.fromuserid.equals(connectionrequest.touserid)) {
        throw new Error("cannot send connection request to yourself");

    }
    next();

});
const Connectionrequestmodel = new mongoose.model("conectionrequest", connectionrequestschema);

module.exports = Connectionrequestmodel;