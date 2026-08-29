const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({

    user:{
        type: mongoose.Schema.Types.ObjectId,
        required:[true, "User is required for account creation"],
        ref:"user"
    },
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
        required:[true,"Date of birth is required for Registration"]
    },
    gender:{
        type:String,
        required:[true,"Gender is required for Registration"],
        enum:{
            values:["MALE", "FEMALE"],
            message:`Gender must be either MALE or FEMALE`
        }
    },
    location:{
        type:String,
        required:[true,"Location is required for registration"],
        trim:true,
        maxlength:[30,"Location should be at most 30 characters"]
    },
    status:{
        type: String,
        required:[true, "Status is required for account creation"],
        enum:{
            values:["ACTIVE", "INACTIVE","FROZEN"],
            message:`Status must be either ACTIVE, INACTIVE or FROZEN`
        },
        default:"ACTIVE"
    },
},{
    timestamps:true
})


userSchema.methods.calculateAge = function(dateOfBirth) {
    const today = new Date();
    const birthday = dateOfBirth ? new Date(dateOfBirth) : new Date(this.dateOfBirth);

    let age = today.getFullYear() - birthday.getFullYear();

    const monthDif = today.getMonth() - birthday.getMonth();

    if (monthDif < 0 || (monthDif === 0 && today.getDate() < birthday.getDate())) {
        age--;
    }

    return age;
};

const account = mongoose.model("account", accountSchema);

module.exports = account;