const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model.js")

const authMiddleware = async(req, res, next)=>{

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(401).json({message:"Access deined, NO TOKEN "})
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

module.exports = authMiddleware