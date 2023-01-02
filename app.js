/*
-------------------Level 2 auth Using Encryption-------------------
const encrypt = require('mongoose-encryption');
Using mongoose-encryption for the encryption of the password
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

-------------------Level 3 auth using hashing-------------------
const md5 = require('md5');
md5(req.body.password) => convert in the hash with the help of the md5
md5(req.body.password) => converting the user enter password in hash and compare with the save hash value in the DB

-------------------Level 4 auth using hashing + salting-------------------
const bcrypt = require('bcrypt');
const saltRounds = 10;
bcrypt.hash(passwordEnterByUser, saltRounds, function(err, hash){
    We will assign the given hash in the DB for the resp user
})
bcrypt.compare(passwordEnterByUser, savePassInDB, function(err, result){
    if(result === true){
        pass enter by the user is correct
    }
})
*/


// Requiring dotenv package to prevent encryption key 
require("dotenv").config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

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

const User = new mongoose.model("User", userSchema);
app.get("/", function (req, res) {
    res.render("home.ejs")
})

app.route("/register")
    .get(function (req, res) {
        res.render("register.ejs")
    })
    .post(function (req, res) {
        bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
            const user = new User({
                userName: req.body.userName,
                password: hash
            });
            user.save(function (err) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("secrets.ejs")
                }
            });
        })
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
                    bcrypt.compare(password, foundUser.password, function (err, result) {
                        if (err) {
                            console.log(err);
                        } else {
                            if (result === true) {
                                res.render("secrets.ejs");
                            } else {
                                alert("Please enter the valid details");
                            }
                        }
                    })
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