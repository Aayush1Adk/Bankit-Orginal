require("dotenv").config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

async function uploadProfile(buffer, mimetype){

    const base64String = buffer.toString("base64");
    const dataURI = `data:${mimetype};base64,` + base64String;

const result = await cloudinary.uploader.upload(dataURI, {
    public_id: "user_" + Date.now(),
    folder: "ProfilePhoto",
    resource_type:"image"
  })
  
  return result;
}

module.exports = { uploadProfile };