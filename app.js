const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const port = process.env.PORT || 3000;
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
main().catch(err => console.log(err));
async function main() {
    mongoose.set("strictQuery", true);
    await mongoose.connect("mongodb://127.0.0.1:27017/authDb")
}

app.get("/", function (req, res) {
    res.render("home.ejs")
})
app.listen(port, function () {
    console.log("Server is running on port " + port);
})