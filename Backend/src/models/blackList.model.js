const mongoose = require("mongoose");

const blackListToken = new mongoose.Schema({
    token :{
        type: String,
        required:[true, "Token is required for blacklisting"],
        unique:[true, "Token already exists in black list"]
    }
},
{
    timestamps: true
});

blackListToken.index({createdAt: 1},{expireAfterSeconds: 60*60*24*3});

const TokenBlackList = mongoose.model("tokenBlackList", blackListToken);

module.exports = TokenBlackList;