const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({

    fromAccount:{
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: "account"
    },
    toAccount:{
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: "account"
    },
    type:{
        type: String,
        enum:{
            values:["TRANSFER", "DEPOSIT", "WITHDRAWAL"],
            message:"Type must be either TRANSFER, DEPOSIT or WITHDRAWAL"
        },
        required:[true, "Type is required for transaction creation"]
    },
    status:{
        type: String,
        enum:{
            values:["PENDING", "COMPLETED", "FAILED", "REVERSED"],
            message:"Status must be either PENDING, COMPLETED, FAILED or REVERSED"
        },
        default:"PENDING"
    },
    amount:{
        type: Number,
        required:[true, "Amount is required for transaction creation"],
        min:[1, "Amount must be greater than 0"]
    },
    idempotencyKey:{
        type: String,
        required:[true, "Idempotency Key is required for transaction creation"],
        unique: true,
        immutable: true
    }
})

transactionSchema.index({fromAccount: 1, toAccount: 1});

const transactionModel = mongoose.model("transaction", transactionSchema);

module.exports = transactionModel;