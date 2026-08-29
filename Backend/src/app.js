const express = require("express");
const multer = require("multer");
const cookieParser = require("cookie-parser")
const accountRouter = require("../src/routers/accountRouter.js");
const authRouter = require("../src/routers/authRouter.js");

const app = express();



app.use(express.json());
app.use(cookieParser())
app.use("/api/auth", authRouter);
app.use("/api/account", accountRouter);

app.get("/", (req, res)=>{
    res.send("Welcome to Bankit API");
})

module.exports = app;