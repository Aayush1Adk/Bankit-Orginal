const user = require("../models/user.model");
const jwt = require("jsonwebtoken");
const uploadProfile = require("../services/cloudinary.js");

const registerUser = async(req, res)=>{

    const {name, dateOfBirth, location, email, password } = req.body;

    if(!req.files || !req.files["profile"]){
        return res.status(400).json({message:"Profile picture is required"});
    }

    if(!name || !dateOfBirth || !location || !email || !password){
        return res.status(400).json({message:"All fields are required"});
    }

    const userExist = await user.findOne({email});

    if(userExist){
        return res.status(400).json({message:"User already exists, try to login"});
    }

    const newUser = await user.create({
        name: name,
        dateOfBirth: dateOfBirth,
        location: location,
        email: email,
        password: password
    })

    const isProduction = process.env.NODE_ENV === "PRODUCTION";

    const token = jwt.sign({id: newUser}, process.env.JWT_SECRET)

    res.token("token", token,{
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 2,
    })


    return res.status(201).json({message:"User has been registered successfully"},newUser);
}

module.exports = {registerUser};

