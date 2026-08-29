const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({

    email:{
        type:String,
        required:[true,"Email is required for registration account"],
        trim:true,
        unique:true,
        lowercase:true,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Please provide a valid email"]
    },
    otp:{
        type:Number,
        default: null

    },
    otpExpiresAt: {
        type: Date,
        default: null
    },
    otpLastSentAt: {
        type: Date,
        default: null
    },
    otpPurpose: {
        type: String,
        enum: [
            "EMAIL_VERIFICATION",
            "PASSWORD_RESET"
        ],    
        default: null
    },
    password:{
        type:String,
        required:[true,"Password is required for Registration"],
        minlength:8,
        select:false
    },
    isEmailVerified:{
        type:Boolean,
        default:false
    }   
},{
    timestamps:true
});



userSchema.pre("save", async function() {
    if (!this.isModified("password")) {
        return;
    }

    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
});

userSchema.methods.comparePassword = async function (password) {

    return await bcrypt.compare(password, this.password)

}

const user = mongoose.model("user",userSchema);

module.exports = user;