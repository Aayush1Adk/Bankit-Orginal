const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model.js")

const authMiddleware = async(req, res)=>{

    const token = req.cookies.token || req.headers.authorization?.split("")[1];

    if(!token){
        return res.status(400).json({message:"Access deined, NO TOKEN "})
    }
    try{
        const decode = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findOne(decode.userId)

        req.user = user;

        next();

    }

    catch(err){
        console.log(err);
        return res.status(400).json({message:"Unauthorized"});
    }
}

module.exports = authMiddleware