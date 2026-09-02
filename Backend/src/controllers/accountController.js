const account = require("../models/account.model.js");
const user = require("../models/user.model.js");
const emailService = require("../services/email.service.js");
const {uploadProfile} = require("../services/cloudinary.js");

const accountCreation = async(req, res)=>{

    const userId = req.user._id;
    const {name, dateOfBirth, location, gender} = req.body;
    const profile = req.file;

    if(!userId || !name || !dateOfBirth || !location || !gender){
        return res.status(400).json({message:"All fields are required"});
    }

    if (!profile) {
    return res.status(400).json({ message: "Profile image is required" });
    }

    const userExist = await account.findOne({ userId });

    if (userExist) {
        return res.status(400).json({ message: "Account already exists for this user" });
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

    await emailService.sendAccountCreationEmail(req.user.email, req.user.name, newAccount.userId);

    return res.status(200).json({message:"Account created successfully", newAccount});
}

const getAccount = async(req, res)=>{

    const userId = req.user._id;

    const accountExist = await account.findOne({ userId });

    if(!accountExist){
        return res.status(404).json({message:"Account does not exist for this user"});
    }

    return res.status(200).json({message:"Account fetched successfully", accountExist});
}

const getBalance = async(req, res)=>{

    const {accountId} = req.params;

    const amount = await accountModel.findOne({
        _id: amountId,
        user: req.user._id
    })

    if(!amount){
        return res.status(404).json({message:"Account does not exist for this user"});
    }

    const balance = await account.getBalance()

    res.status(404).json({message:"Balance fetched successfully", balance});
}


module.exports = { accountCreation, getAccount, getBalance }