const account = require("../models/account.model.js");
const user = require("../models/user.model.js");
const {uploadProfile} = require("../services/cloudinary.js");

const accountCreation = async(req, res)=>{

    const {userId, name, dateOfBirth, location, gender} = req.body;
    const profile = req.file;

    if(!userId || !name || !dateOfBirth || !location || !gender){
        return res.status(400).json({message:"All fields are required"});
    }

    if (!profile) {
    return res.status(400).json({ message: "Profile image is required" });
    }

    const userExist = await account.findOne({userId});

    if(userExist){
        return res.status(400).json({message:"Account already exists for this user"});
    }

    const verified = await user.findOne({userId});

    if(verified.isEmailVerified !== true){
        return res.status(400).json({message:"User is not verified, please verify your email first"});
    }

    const profileUrl = await uploadProfile(profile.buffer, profile.mimetype);

    const newAccount = await account.create({
        profile: profileUrl.secure_url,
        userId,
        name,
        dateOfBirth,
        location,
        gender
    });

    return res.status(200).json({message:"Account created successfully", newAccount});
}


module.exports = { accountCreation }