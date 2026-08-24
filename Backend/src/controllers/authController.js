const user = require("../models/user.model");
const jwt = require("jsonwebtoken");
const {uploadProfile} = require("../services/cloudinary.js");
const emailService = require("../services/email.service.js");
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

        await emailService.sendRegistrationEmail(newUser.email, newUser.name);

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

    const {email, password, otp} = req.body;

    try{

    const emailExist = await user.findOne({email}).select("+password");

    if(!emailExist){
        return res.status(400).json({message:"User does not exist"});
    }

    const isValidPassword = await emailExist.comparePassword(password);

    if(!isValidPassword){
        return res.status(400).json({message:"Password is incorrect"});
    }

    const createOTP = Math.floor(100000 + Math.random() * 900000);

        emailExist.otp = createOTP;

        emailExist.otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000);

        emailExist.otpPurpose = "LOGIN";

        await emailExist.save();
        

        await emailService.sendOTPEmail(emailExist.email, createOTP);

        console.log(createOTP)
        return res.status(200).json({
            message: "OTP sent successfully"
        });

        }
        catch(err){
            return res.status(400).json({message:"Login Failed"});
        }

}

const verifyLoginOTP = async(req,res)=>{

    const {email, otp} = req.body;

    try{
        
        const emailExist = await user.findOne({email});

        if(!emailExist){
            return res.status(400).json({message:"User does not exist"});
        }
        if(!emailExist.otp){
            return res.status(400).json({message:"OTP not found"});
        }

        if (emailExist.otpExpiresAt < new Date()) {
            return res.status(400).json({message: "OTP has expired"});
        }

        if (emailExist.otpPurpose !== "LOGIN") {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if(emailExist.otp !== Number(otp)){
            return res.status(400).json({message:"OTP is incorrect"});
        }

        emailExist.otp = null;
        emailExist.otpExpiresAt = null;
        emailExist.otpPurpose = null;

        await emailExist.save();

        const payload = {
            id: emailExist._id,
            email: emailExist.email
        };

        const token = jwt.sign({payload},process.env.JWT_SECRET,{expiresIn:"3d"});

        const isProduction = process.env.NODE_ENV === "PRODUCTION";

        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction? "none" : "lax",
            maxAge: 1000 * 60 * 60 * 24 * 2
        })

        return res.status(200).json({
            message: "User has been logged in successfully",
            _id: emailExist._id,
            email: emailExist.email,
            name: emailExist.name
        });


    }
    catch(err){

        console.error("LOGIN ERROR:", err);
        return res.status(500).json({
            message: err.message,
            error: err
        });

    }

}


async function generateOTP(){

    const emailExist = await user.findOne({email}).select("+password");

    if(!emailExist){
        return res.status(400).json({message:"User does not exist"});
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    
    const otpSave = await user.findOneAndUpdate({
        otp:otp
    });
    return otp

    await emailService.sendOTPEmail(emailExist.email, otp);
}


module.exports = {registerUser, loginUser, verifyLoginOTP};

