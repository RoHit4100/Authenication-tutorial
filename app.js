
// Requiring dotenv package to prevent encryption key 
require("dotenv").config();

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

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
    password: String,
    googleId: String,
    secret: String
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());

passport.serializeUser((user, done) => {
    done(null, user.id); //user.id is the id from Mongo
});


passport.deserializeUser((id, done) => {
    User.findById(id)
        .then(user => {
            done(null, user)
        })
        .catch((err) => done('pass')); //you should use catch like this
});

passport.deserializeUser((obj, done) => {
    Admin.deserializeUser();
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:300/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
    function (accessToken, refreshToken, profile, cb) {
        console.log(profile);
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }
));

app.get("/", function (req, res) {
    res.render("home.ejs")
})

app.get("/secrets", function (req, res) {
    User.find({ "secret": { $ne: null } }, function (err, foundUsers) {
        if (err) {
            console.log(err);
        } else {
            res.render("secrets.ejs", { userWithSecrets: foundUsers });
        }
    })
})

app.get("/submit", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("submit.ejs");
    } else {
        res.redirect("/login");
    }
})

app.post("/submit", function (req, res) {
    const submittedSecret = req.body.secret;
    console.log(req.user.id);
    User.findById(req.user.id, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                foundUser.secret = submittedSecret;
                foundUser.save(function () {
                    if (err) {
                        console.log(err);
                    }
                    res.redirect("/secrets")
                });
            }
        }
    })
})

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] })
);

app.get('/auth/google/secrets',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect("/secrets");
    });

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