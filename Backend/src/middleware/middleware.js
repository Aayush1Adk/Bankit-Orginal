const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const userModel = require("../models/user.model.js")
const TokenBlackList = require("../models/blackList.model.js");
const transactionModel = require("../models/transaction.model.js");

const authMiddleware = async(req, res, next)=>{

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(401).json({message:"Access deined, NO TOKEN "})
    }

    const blacklistedToken = await TokenBlackList.findOne({ token });

    if (blacklistedToken) {
        return res.status(401).json({ message: "Token is blacklisted" });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findOne({_id: decoded.id})

    if (!user) {
        return res.status(401).json({ message: "User not found" });
    }

    if (!user.isEmailVerified) {
        return res.status(403).json({ message: "User is not verified, please verify your email first"});
    }
        req.user = user;

        next();

    }

    catch(err){
        console.log(err);
        return res.status(401).json({message:"Unauthorized"});
    }
}

const transferMiddleware = async(req, res, next)=>{

    const {fromAccount, toAccount, amount, idempotencyKey, type} = req.body;
    

    if(!fromAccount || !toAccount || !idempotencyKey){
        return res.status(400).json({message:"All fields are required"});
    }

    if(fromAccount === toAccount){
        return res.status(400).json({message:"From account and to account cannot be same"});
    }

    if(!mongoose.Types.ObjectId.isValid(fromAccount) || !mongoose.Types.ObjectId.isValid(toAccount)){
        return res.status(400).json({message:"Invalid account id"});
    }

    if(typeof amount !== "number"){
        return res.status(400).json({message:"Amount must be a number"});
    }

    if(amount <= 0 || !Number.isFinite(amount)  || amount > 100000000){
        return res.status(400).json({message:"Amount must be greater than 0"});
    }

    next();
}

const depositMiddleware = async(req, res, next)=>{
    const {toAccount, amount, idempotencyKey, type} = req.body;

    if(!toAccount || !idempotencyKey){
        return res.status(400).json({message:"All fields are required"});
    }

    if(!mongoose.Types.ObjectId.isValid(toAccount)){
        return res.status(400).json({message:"Invalid account id"});
    }

    if(typeof amount !== "number"){
        return res.status(400).json({message:"Amount must be a number"});
    }

    if(amount <= 0 || !Number.isFinite(amount)  || amount > 100000000){
        return res.status(400).json({message:"Amount must be greater than 0"});
    }

    next();
}



module.exports = {authMiddleware, transferMiddleware, depositMiddleware}