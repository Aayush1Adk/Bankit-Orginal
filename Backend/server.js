require("dotenv").config();
const connectDB = require("./src/config/db.js");
const app = require("./src/app.js");

connectDB();

const PORT = 3000;

app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`);
})

