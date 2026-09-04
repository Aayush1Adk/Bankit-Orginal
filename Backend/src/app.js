const express = require("express");
const cookieParser = require("cookie-parser")
const accountRouter = require("./routers/accountRouter.js");
const authRouter = require("./routers/authRouter.js");
const transactionRouter = require("./routers/transactionRouter.js");

const app = express();



app.use(express.json());
app.use(cookieParser())
app.use("/api/auth", authRouter);
app.use("/api/account", accountRouter);
app.use("/api/transaction", transactionRouter);

app.get("/", (req, res)=>{
    res.send("Welcome to Bankit API");
})

module.exports = app;