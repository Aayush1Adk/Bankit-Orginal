const jwt = require("jsonwebtoken");

const authMiddleware = async(req, res)=>{

    const token = req.cookies.token || req.headers.authorization?.split("")[1];

    if(!token){
        return res.status(400).json({message:"Access deined, NO TOKEN "})
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    
}