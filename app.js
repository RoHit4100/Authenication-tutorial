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

/*
-------------------For registration till level 4 auth-------------------
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

-------------------For login till level 4 auth-------------------
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
*/

/*
-------------------To use cookies to store the sessions with help of nodeJS in the browser-------------------
    First we have to install some packages by using npm
    - express-session
    - passport 
    - passport-local
    - passport-local-mongoose
    
    Then we have to require them in a particular sequence which is,
    - const session = require('express-session');
    - const passport = require('passport');
    - const passportLocalMongoose = require('passport-local-mongoose');

    Then we have to use the session package and initial configuration,
        app.use(session({
            secret: "any secret key",
            resave: false,  //tell the session store that a particular session is still active, which is necessary because some stores will delete idle (unused) sessions after some time.
            saveUninitialized: false  //If during the lifetime of the request the session object isn't modified then, at the end of the request and when saveUninitialized is false, the (still empty, because unmodified) session object will not be stored in the session store.
        }));

    Now to use the passport for the creating the session we have to first initialize passport,
    app.use(passport.initialized());
    app.use(passport.session());  //passport to dealing with the sessions.
    
    Now in order to use the passport-local-mongoose package we have to use as plugin for the mongoose schema that we have created(Note: use only after declaring the mongoose schema).
    userSchema.plugin(passportLocalMongoose);  //We are going to use passportLocalMongoose to hashing + salting and storing those info directly into our DB.

    Now we have to use passport local configuration(Note: It should be use after the declaring the model by using the mongoose schema),
    passport.use(User.createStrategy());  //local strategy to authenticate users using there username and the password
    - It is only needed when we are using the sessions.
    passport.serializeUser(User.serializeUser());  // Stuffs the userID in the cookie.
    passport.deserializeUser(User.deserializeUser());  // Discover the message which is present in the cookie and use that that msg to identify the userID to authenticate them.
    (This order is the important.)

    Now use passport-local-mongoose method to register, login, logout the user, we use passport-local-mongoose as a middle-man to handle all of steps needed to save the data in the mongoose DB.
        User.register({username: req.body.username}, req.body.password, (err, user) => {
            if(!err){
                passport.authenticate("local")(req, res, () => {  //We will authenticate the user by using local authentication and redirect in the response to the our secrets route.
                    res.redirect("/secrets")
                })
            }
        })
    After sending user to the secrets route we will check if the user is authenticated by using req.isAuthenticated() method if is is true then we will render our secrets.ejs

    Passport have a login() function on req that is used to establish the login session,
        const user = new User({
            username: req.body.username,
            password: req.body.password
        });
    
        req.login(user, function(err){
            if(!err){
                passport.authenticate("local")(req, res, () => {
                    res.redirect("/secrets");
                });
            }
        });

    To deAuthenticate the user passport have the method called as logout on req that used to terminate the session.
        req.logout((err) => {
            if(err){
                console.log(err);
            }
        });
*/


// Requiring dotenv package to prevent encryption key 
require("dotenv").config();

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const { request, response } = require("express");

const port = process.env.PORT || 3000;
const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
})
);
app.use(passport.initialize());
app.use(passport.session());

main().catch(err => console.log(err));
async function main() {
    mongoose.set("strictQuery", true);
    await mongoose.connect("mongodb://127.0.0.1:27017/authDb")
}

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function (req, res) {
    res.render("home.ejs")
})

app.get("/secrets", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("secrets.ejs");
    } else {
        res.redirect("/login");
    }
})

app.get("/logout", function (req, res) {
    req.logout(function (err) {
        if (err)
            console.log(err);
        else
            res.redirect("/");
    });
})

app.route("/register")
    .get(function (req, res) {
        res.render("register.ejs")
    })
    .post(function (req, res) {
        const username = (req.body.username);
        const password = (req.body.password);
        User.register({ username: username }, password, function (err, user) {
            if (err) {
                console.log(err);
                res.redirect("/register")
            } else {
                passport.authenticate("local")(req, res, function () {
                    res.redirect("/secrets")
                })
            }
        })
    })
app.route("/login")
    .get(function (req, res) {
        res.render("login.ejs")
    })
    .post(function (req, res) {
        const username = req.body.username;
        const password = req.body.password;
        const user = new User({
            username: username,
            password: password
        });

        req.login(user, function (err) {
            if (err) {
                console.log(err);
            } else {
                passport.authenticate("local")(req, res, function () {
                    res.redirect("/secrets")
                })
            }
        })
    })


app.listen(port, function () {
    console.log("Server is running on port " + port);
})