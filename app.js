// Requiring dotenv package to prevent encryption key 
require("dotenv").config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
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

const userSchema = new mongoose.Schema({
    userName: String,
    password: String
});
// Using mongoose-encryption for the encryption of the password
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = new mongoose.model("User", userSchema);
app.get("/", function (req, res) {
    res.render("home.ejs")
})

app.route("/register")
    .get(function (req, res) {
        res.render("register.ejs")
    })
    .post(function (req, res) {
        const user = new User({
            userName: req.body.userName,
            password: req.body.password
        });
        user.save(function (err) {
            if (err) {
                console.log(err);
            } else {
                res.render("secrets.ejs")
            }
        });
    })
app.route("/login")
    .get(function (req, res) {
        res.render("login.ejs")
    })
    .post(function (req, res) {
        const userName = (req.body.userName).trim();
        const password = (req.body.password).trim();
        User.findOne({ userName: userName }, function (err, foundUser) {
            if (err) {
                console.log(err);
            } else {
                if (foundUser) {
                    if (foundUser.password === password) {
                        res.render("secrets.ejs");
                    } else {
                        alert("Please enter the valid details")
                    }
                }
            }
        })
    })


app.get("/logout", function (req, res) {
    res.render("home.ejs");
})
app.listen(port, function () {
    console.log("Server is running on port " + port);
})