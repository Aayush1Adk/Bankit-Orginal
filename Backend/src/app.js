const express = require("express");
const multer = require("multer");

const app = express();


app.use(express.json());

module.exports = app;