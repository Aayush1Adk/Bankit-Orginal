const account = require("../models/account.model.js");
const {uploadProfile} = require("../services/cloudinary.js");

const accountCreation = async(req, res)=>{

    const {user, name, dateOfBirth, location, gender, status} = req.body;
    const profile = req.file;

    if(!user || !name || !dateOfBirth || !location || !gender || !status){
        return res.status(400).json({message:"All fields are required"});
    }

    if (!profile) {
    return res.status(400).json({ message: "Profile image is required" });
    }

    const userExist = await account.findOne({user});

    if(userExist){
        return res.status(400).json({message:"Account already exists for this user"});
    }

    const profileUrl = await uploadProfile(profile.buffer, profile.mimetype);

    const newAccount = await account.create({
        profile: profileUrl.secure_url,
        user,
        name,
        dateOfBirth,
        location,
        gender,
        status
    });

    return res.status(200).json({message:"Account created successfully", newAccount});
}
