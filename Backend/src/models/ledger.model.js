const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema({
    account:{
        type: mongoose.Schema.Types.ObjectId,
        required:[true, "Account is required for ledger creation"],
        immutable:true
    },
    amount:{
        type:Number,
        required:[true, "Amount is required for ledger creation"],
        immutable: true
    },
    transaction:{
        type: String,
        ref:"transaction",
        required:[true,"Transaction is required for ledger creation"],
        immutable:true
    },
    type:{
        type: String,
        enum:{
            values:["CREDIT", "DEBIT"],
            message:"Type must be either CREDIT or DEBIT"
        },
        required:[true,"Ledger type is required"],
        immutable:true
    }
})

ledgerSchema.index({account: 1, transaction: 1});

function preventLedgerModification(){
    throw new Error("Ledger cannot be modified");
}

ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);
ledgerSchema.pre("findOneAndDelete", preventLedgerModification);
ledgerSchema.pre("updateOne", preventLedgerModification);
ledgerSchema.pre("deleteOne", preventLedgerModification);
ledgerSchema.pre("remove", preventLedgerModification);
ledgerSchema.pre("deleteMany", preventLedgerModification);
ledgerSchema.pre("updateMany", preventLedgerModification);
ledgerSchema.pre("findOneAndReplace", preventLedgerModification);

const ledgerModel = mongoose.model("ledger", ledgerSchema);

module.exports = ledgerModel;