const validator = require("validator");
const validatesignupdata = (req) => {
    const { firstname, lastname, emailid, password } = req.body;

    if (!firstname || !lastname) {
        throw new Error("name is not valid");
    }
    else if (!validator.isEmail(emailid)) {
        throw new Error("email is not valid");
    }
    else if (!validator.isStrongPassword(password)) {
        throw new Error("please enter a strong password");
    }
};

const validateeditprofiledata = (req) => {
    const allowededitfields = [
        "firstname",
        "lastname",
        "photourl",
        "gender",
        "age",
        "about",
        "skills",
    ];
    const iseditallowed = Object.keys(req.body).every((field) => allowededitfields.includes(field));
    return iseditallowed;
};

module.exports = {
    validatesignupdata,
    validateeditprofiledata,
};