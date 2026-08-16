const user = require("../models/user.model");

const registerUser = async(req, res)=>{

    const {name, dateOfBirth, location, email, password } = req.body;

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

    return res.status(201).json(newUser);
}

module.exports = {registerUser};

