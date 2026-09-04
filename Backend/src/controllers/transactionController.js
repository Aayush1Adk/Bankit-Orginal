const ledgerModel = require("../models/ledger.model.js");
const transactionModel = require("../models/transaction.model.js");
const mongoose = require("mongoose");
const account = require("../models/account.model.js");
const emailService = require("../services/email.service.js");

const createTransaction = async (req, res) => {

    const {fromAccount, toAccount, amount, idempotencyKey} = req.body;

    const fromAccountExist = await account.findOne({ _id: fromAccount });
    const toAccountExist = await account.findOne({ _id: toAccount });

    if(!fromAccountExist || !toAccountExist){
        return res.status(400).json({message:"Account does not exist"})
    } 

    if(fromAccountExist.status !== "ACTIVE" || toAccountExist.status !== "ACTIVE"){
        return res.status(400).json({message:"Account is not active"})
    }

    if (fromAccountExist.userId.toString() !== req.user._id.toString()){
        return res.status(403).json({message:"You are not authorized to perform this transaction"})
    }

    const balance = await fromAccountExist.getBalance();

    if(balance < amount){
        return res.status(400).json({message:"Insufficient balance"})
    }

    const transactionExist = await transactionModel.findOne({idempotencyKey});

    if(transactionExist){

        if(transactionExist.status === "COMPLETED"){
            return res.status(400).json({message:"Transaction already completed", transaction: transactionExist})
        }
        else if(transactionExist.status === "PENDING"){
            return res.status(400).json({message:"Transaction already pending"})
        }
        else if(transactionExist.status === "FAILED"){
            return res.status(400).json({message:"Transaction failed"})
        }
        else if(transactionExist.status === "REVERSED"){
            return res.status(400).json({message:"Transaction reversed"})
        }
    }

    const session = await mongoose.startSession()
    try{
    session.startTransaction();

    const [transaction] = await transactionModel.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status:"PENDING"}],
        {session}
    );

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromAccount,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"}],
    {session}
    );

    const creditLederEntry = await ledgerModel.create([{
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"}],
    {session}
    );

    await transactionModel.updateOne(
        { _id: transaction._id },
        { status: "COMPLETED" },
        { session }
    );
    
    await session.commitTransaction();    
    await emailService.sendTransactionEmail(fromAccountExist.email, fromAccountExist.name, amount, toAccountExist.name)

    return res.status(201).json({ message: "Transaction completed successfully",transaction});
    }

    catch(err){

        await session.abortTransaction();
        await emailService.sendTransactionFailureEmail(fromAccountExist.email, fromAccountExist.name, amount, toAccountExist.name);
        return res.status(400).json({message:"Transaction failed"})
    }

    finally {
    await session.endSession();
    }
}

module.exports = {createTransaction}