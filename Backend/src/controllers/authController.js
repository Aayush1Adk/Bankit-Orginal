const user = require("../models/user.model");
const jwt = require("jsonwebtoken");
const {uploadProfile} = require("../services/cloudinary.js");

const registerUser = async(req, res)=>{

    const {name, dateOfBirth, location, email, password } = req.body;

    if (!req.file) {
    return res.status(400).json({ message: "Profile image is required" });
    }

    if(!name || !dateOfBirth || !location || !email || !password){
        return res.status(400).json({message:"All fields are required"});
    }

    try{
    const profile = req.file;

    const profileUrl = await uploadProfile(profile.buffer, profile.mimetype);

    const userExist = await user.findOne({email});

    if(userExist){
        return res.status(400).json({message:"User already exists, try to login"});
    }

    const newUser = await user.create({
        profile: profileUrl.secure_url,
        name,
        dateOfBirth,
        location,
        email,
        password
    })

    const isProduction = process.env.NODE_ENV === "PRODUCTION";

    const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET)

    res.cookie("token", token,{
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 2,
    })

    console.log("User has been created successfully")
    return res.status(201).json({
        message:"User has been registered successfully",
        user: newUser
    });
    }
    
    catch(err){
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({
        message: err.message,
        error: err
    });
}
}

module.exports = {registerUser};

