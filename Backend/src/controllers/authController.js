const user = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service.js");
const TokenBlackList = require("../models/blackList.model.js");


//--------------------SIGN-UP--------------------//
const registerUser = async(req, res)=>{

    const { email, password } = req.body;

    if(!email || !password){
        return res.status(400).json({message:"All fields are required"});
    }

    try{

    const userExist = await user.findOne({email});

    if(userExist){
        return res.status(400).json({message:"User already exists, try to login"});
    }

    const newUser = await user.create({
        email,
        password

    })

    const createOTP = Math.floor(100000 + Math.random() * 900000);

    newUser.otp = createOTP;

    newUser.otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000);

    newUser.otpLastSentAt = new Date();

    newUser.otpPurpose = "EMAIL_VERIFICATION";

    await newUser.save();

    await emailService.sendRegistrationEmail(newUser.email, newUser.name, newUser.otp);


        console.log(`User has been created successfully. OTP is: ${createOTP}`)
    return res.status(201).json({
        message: "Registration successful. Please verify your email.",
        userId: newUser._id,
        email: newUser.email
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



//----------------verifyEmail------------------//

const verifyEmail = async(req, res)=>{

    const {email,otp} = req.body;

    try{

    const emailExist = await user.findOne({email});

    if(!emailExist){
        return res.status(400).json({message:"User does not exist"});
    }

        if(!emailExist.otp){
            return res.status(400).json({message:"OTP not found"});
        }

        if (emailExist.otpExpiresAt < new Date()) {
            emailExist.otp = null;
            emailExist.otpExpiresAt = null;
            emailExist.otpPurpose = null;
            await emailExist.save();
            return res.status(400).json({message: "OTP has expired"});
        }

        if (emailExist.otpPurpose !== "EMAIL_VERIFICATION") {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if(emailExist.otp !== Number(otp)){
            return res.status(400).json({message:"OTP is incorrect"});
        }

        emailExist.isEmailVerified = true;
        emailExist.otp = null;
        emailExist.otpExpiresAt = null;
        emailExist.otpPurpose = null;

        await emailExist.save();

    const isProduction = process.env.NODE_ENV === "PRODUCTION";

    const token = jwt.sign({id: emailExist._id, email: emailExist.email }, process.env.JWT_SECRET,{ expiresIn: "3d" })

    res.cookie("token", token,{
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 3,
    })

        return res.status(201).json({
        message:"Email has been verified successfully",
        email: emailExist.email
        })
}

    catch(err){
        console.error("EMAIL VERIFICATION ERROR:", err);
        return res.status(500).json({
            message: err.message,
            error: err
        });
    }
}


//------------------sendOTP-----------------//

const sendOTP = async(req, res)=>{

    const{email} = req.body;

    try{

    const newUser = await user.findOne({email});

    if(!newUser){
        return res.status(400).json({message:"User does not exist"});
    }

    if(newUser.isEmailVerified){
        return res.status(400).json({message:"Email is already verified"});
    }

    if ( newUser.otpLastSentAt && Date.now() - newUser.otpLastSentAt.getTime() < 60 * 1000 ){
        return res.status(429).json({message:"OTP can only be sent once per minute"});
    }


    const createOTP = Math.floor(100000 + Math.random() * 900000);

    newUser.otp = createOTP;

    newUser.otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000);

    newUser.otpLastSentAt = new Date();

    newUser.otpPurpose = "EMAIL_VERIFICATION";

    await newUser.save();

    await emailService.sendOTPEmail(newUser.email, createOTP);
    

    return res.status(200).json("Check you email for the OTP, it will expire in 2 minutes");
}
        catch (err) {
        console.error("SEND OTP ERROR:", err);

        return res.status(500).json({
            message: "Failed to send OTP"
        });
}
}



//-----------------LOGIN-----------------//

const loginUser = async(req, res)=>{

    const {email, password} = req.body;

    try{

    const emailExist = await user.findOne({email}).select("+password");

    if(!emailExist){
        return res.status(400).json({message:"User does not exist"});
    }

    const isValidPassword = await emailExist.comparePassword(password);

    if(!isValidPassword){
        return res.status(400).json({message:"Password is incorrect"});
    }

        const token = jwt.sign({ id: emailExist._id, email: emailExist.email } ,process.env.JWT_SECRET,{expiresIn:"3d"});

        const isProduction = process.env.NODE_ENV === "PRODUCTION";

        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction? "none" : "lax",
            maxAge: 1000 * 60 * 60 * 24 * 3
        })

        await emailService.sendLoginEmail(emailExist.email, emailExist.name);

        return res.status(200).json({
            message: "User has been logged in successfully",
            _id: emailExist._id,
            email: emailExist.email,
            name: emailExist.name
        });

        

        }
        catch(err){
            return res.status(400).json({message:"Login Failed"});
        }

}


//-------------forget password-----------------//

const forgetPassword = async(req, res)=>{

    const {email} = req.body;

    try{

        const emailCheck = await user.findOne({email});

        if(!emailCheck){
            return res.status(400).json({message:"User does not exist"});
        }

        if ( emailCheck.otpLastSentAt && Date.now() - emailCheck.otpLastSentAt.getTime() < 60 * 1000 ){
            return res.status(429).json({message:"OTP can only be sent once per minute"});
        }


        const createOTP = Math.floor(100000 + Math.random() * 900000);

        emailCheck.otp = createOTP;

        emailCheck.otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000);

        emailCheck.otpLastSentAt = new Date();

        emailCheck.otpPurpose = "PASSWORD_RESET";

        await emailCheck.save();


        await emailService.sendOTPEmail(emailCheck.email, createOTP);


        return res.status(200).json({
            message: "Check your email for the OTP, it will expire in 2 minutes"
        });



    }
    catch(err){

        console.error("FORGET PASSWORD ERROR:", err);
        return res.status(500).json({
            message: "An error occurred while processing your request",
            error: err
        });
    }
    }

    const resetPassword = async(req, res)=>{

        const {email, otp, newPassword} = req.body;

        try{

        if(!email || !otp || !newPassword) {
            return res.status(400).json({message:"All fields are required"});
        }

        const emailExist = await user.findOne({email}).select("+password");

        if(!emailExist){
            return res.status(400).json({message:"User does not exist"});
        }
        
        if(!emailExist.otp){
            return res.status(400).json({message:"OTP not found"});
        }

        if (emailExist.otpExpiresAt < new Date()) {
            return res.status(400).json({message: "OTP has expired"});
        }

        if (emailExist.otpPurpose !== "PASSWORD_RESET") {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if(emailExist.otp !== Number(otp)){
            return res.status(400).json({message:"OTP is incorrect"});
        }

        emailExist.password = newPassword;
        emailExist.otp = null;
        emailExist.otpExpiresAt = null;
        emailExist.otpPurpose = null;

        await emailExist.save();

        return res.status(200).json({
            message: "Password has been reset successfully"
        });
        }
        catch(err){
            return res.status(500).json({
                message: "An error occurred while resetting the password",
                error: err
            });
        }
    }

    //---------------logout-----------------//

const logoutUser = async (req, res) => {

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (token) {
        await TokenBlackList.create({
            token
        });
    }

    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax"
    });

    return res.status(200).json({
        message: "User logged out successfully"
    });
};



module.exports = {registerUser, loginUser, verifyEmail, sendOTP, forgetPassword, resetPassword, logoutUser};

