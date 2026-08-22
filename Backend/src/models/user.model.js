const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
    profile:{
        type: String,
        required:[true,"Profile Picture is required for Registration"],

    },
    name:{
        type:String,
        required:[true,"Name is required to create Registration"],
        trim:true,
        minlength:[3,"Name should be at least 3 characters"],
        maxlength:[20,"Name should be at most 20 characters"]
    },
    dateOfBirth:{
        type:Date,
        required:[true,"Date of birth is required for Registration"],
        trim:true
    },
    location:{
        type:String,
        required:[true,"Location is required for registration"],
        trim:true,
        maxlength:[30,"Location should be at most 30 characters"]
    },
    email:{
        type:String,
        required:[true,"Email is required for registration account"],
        trim:true,
        unique:true,
        lowercase:true,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Please provide a valid email"]
    },
    password:{
        type:String,
        required:[true,"Password is required for Registration"],
        minlength:8,
        select:false
    }   
},{
    timestamps:true
});

userSchema.methods.calculateAge = async function(dateOfBirth){

    const today = new Date();
    const birthday = new Date(dateOfBirth);

    let age = today.getFullYear() - birthday.getFullYear();

    const monthDif = today.getMonth() - birthday.getMonth();

    if(monthDif < 0 || (monthDif === 0 && today.getDate() < birthday.getDate())){
        age--;
    }

    return age;
};

userSchema.pre("save", async function(next){
    
    if (!this.isModified("password")){
        return
    }

    const hash = await bcrypt.hash(this.password, 10)
    this.password = hash;
    return;
})

userSchema.methods.comparePassword = async function(password){
    
    return await bcrypt.compare(password, this.password)

}

const user = mongoose.model("user",userSchema);

module.exports = user;