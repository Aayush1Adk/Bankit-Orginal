const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({

    fromAccount:{
        type: mongoose.Schema.Types.ObjectId,
        required:[true, "From Account is required for transaction creation"],
        ref: "account"
    },
    toAccount:{
        type: mongoose.Schema.Types.ObjectId,
        required:[true, "To Account is required for transaction creation"],
        ref: "account"
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
        min:[0, "Amount must be greater than 0"]
    },
    idempotencyKey:{
        type: Number,
        required:[true, "Idempotency Key is required for transaction creation"],
        unique: true
    }
})

transactionSchema.index({fromAccount: 1, toAccount: 1});

const transactionModel = mongoose.model("transaction", transactionSchema);

module.exports = transactionModel;