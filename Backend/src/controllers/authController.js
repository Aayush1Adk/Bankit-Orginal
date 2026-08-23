const user = require("../models/user.model");
const jwt = require("jsonwebtoken");
const {uploadProfile} = require("../services/cloudinary.js");

//--------------------SIGN-UP--------------------//
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

//-----------------LOGIN-----------------//

const loginUser = async(req, res)=>{

    const {email, password} = req.body;

    const emailExist = await user.findOne({email}).select("+password");

    if(!emailExist){
        return res.status(400).json({message:"User does not exist"});
    }

    const isValidPassword = await emailExist.comparePassword(password);

    if(!isValidPassword){
        return res.status(400).json({message:"Password is incorrect"});
    }

    const payload = {
        id: emailExist._id,
        email: emailExist.email
    }

    const token = jwt.sign({payload},process.env.JWT_SECRET,{expiresIn:"3d"});
    
    const isProduction = process.env.NODE_ENV === "PRODUCTION";

    res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 2,
    })

    console.log("User has been logged in successfully");
    res.status(200).json({
        message:"User has been logged in successfully",
        _id: emailExist._id,
        email: emailExist.email,
        name: emailExist.name
    })

}

const forgetPassword = async(req, res)=>{

    const {email, name} = req.body;

    const emailExist = await user.findOne({email}).select("+password");

    if(!emailExist){
        return res.status(400).json({message:"User does not exist"});
    }

    if(emailExist.name !== name){
        return res.status(400).json({message:"Name is incorrect"});
    }

    const payload = {
        id: emailExist._id,
        email: emailExist.email
    }

    const token = jwt.sign({payload},process.env.JWT_SECRET,{expiresIn:"3d"});
    
    const isProduction = process.env.NODE_ENV === "PRODUCTION";

    res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 2,
    })

    const passwordReset = await user.findOneAndUpdate({email},{$set:{passwordResetToken:token}},{new:true});



    console.log("User has been logged in successfully");

}

module.exports = {registerUser, loginUser};

