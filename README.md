
# Authentication Levels

This is the repository to help in Authentication for any website or any application, Anyone can go through this repository and learn how to implement the authentication from with the help of various packages which are provided ny node.

This project is for the folks who are looking to learn authentication for there personal projects and wants to implement very secure web application or website.




## Different Levels

### Level 1 auth: 
- &nbsp; &nbsp;  In this level we just simply save the user data in DB & all the data present in the DB is save in the plane text, that is the major and the biggest issue for these level.
- &nbsp; &nbsp;  Anyone can get the access of the DB and the present in the DB may lead them to the price. To avoid these we need to push the data in the database by using various encryption techniques.
### Level 2 auth: 
- &nbsp; &nbsp; In this level we use Encryption.
- &nbsp; &nbsp; For encyption we can use the mongoose-encryption package which use the Simple encryption and authentication for mongoose documents and relies on the Node crypto module. Encryption and decryption happen transparently during save and find. Rather than encrypting fields individually, this plugin takes advantage of the BSON nature of mongoDB documents to encrypt multiple fields at once.
- &nbsp; &nbsp; Encryption is performed using AES-256-CBC with a random, unique initialization vector for each operation. Authentication is performed using HMAC-SHA-512.
### Level 3 auth:
- &nbsp; &nbsp; In this level we use Hashing.
- &nbsp; &nbsp; For Hashing we use md5 package, In this level we will convert the password which is enter by the user at the time of registration and save into the data base, this password will be converted in the form of hash value.
- &nbsp; &nbsp; When user will try to login we will compare the hash value which is store in the DB with the generated hash value by the user at the time of login.
### Level 4 auth:
- &nbsp; &nbsp; In this level we use the concept of Hashing and Salting, salting is the random generated code which we will multiply with the hash value.
- &nbsp; &nbsp; In this level we use bcrypt package, which various method to make over application secure. In this package we have one variable called as saltRound in which we can define the saltRound number means how much time we want to generat salt and multi with the hash value.
- &nbsp; &nbsp; To secure the password enter by the user at time of registration we will use,

        ```javascript
        bcrypt.hash(passwordEnterByUser, saltRounds, function(err, hash){
            We will assign the given hash in the DB for the resp user
        })
        ```
- &nbsp; &nbsp; To compare the password at the time of login we will use,
        
        bcrypt.compare(passwordEnterByUser, savePassInDB, function(err, result){
            if(result === true){
                pass enter by the user is correct
            }
        })

### Level 5 auth:
- &nbsp; &nbsp; In this level we use cookies to store the sessions with help of nodeJS in the browser.
- &nbsp; &nbsp; First we have to install some packages by using npm,

        express-session
        passport 
        passport-local
        passport-local-mongoose
- &nbsp; &nbsp;  Then we have to require them in a particular sequence which is,

        const session = require('express-session');
        const passport = require('passport');
        const passportLocalMongoose = require('passport-local-mongoose');

- &nbsp; &nbsp; Then we have to use the session package and initial configuration,
        
        app.use(session({
            secret: "any secret key",
            resave: false,  // Tell the session store that a particular session is still active, which is necessary because some stores will delete idle (unused) sessions after some time.
            saveUninitialized: false  // If during the lifetime of the request the session object isn't modified then, at the end of the request and when saveUninitialized is false, 
                                        the (still empty, because unmodified) session object will not be stored in the session store.
        }));
        
- &nbsp; &nbsp; Now to use the passport for the creating the session we have to first initialize passport,
        
        app.use(passport.initialized());
        app.use(passport.session());  //passport to dealing with the sessions.
- &nbsp; &nbsp;  Now in order to use the passport-local-mongoose package we have to use as plugin for the mongoose schema that we have created(Note: use only after declaring the mongoose schema).

        userSchema.plugin(passportLocalMongoose);  //We are going to use passportLocalMongoose to hashing + salting and storing those info directly into our DB.  

- &nbsp; &nbsp; Now we have to use passport local configuration(Note: It should be use after the declaring the model by using the mongoose schema),

        passport.use(User.createStrategy());  //local strategy to authenticate users using there username and the password.
    
- &nbsp; &nbsp; It is only needed when we are using the sessions.

        passport.serializeUser(User.serializeUser());  // Stuffs the userID in the cookie.
        passport.deserializeUser(User.deserializeUser());  // Discover the message which is present in the cookie and use that that msg to identify the userID to authenticate them.
        (This order is the important.)
- &nbsp; &nbsp;  Now use passport-local-mongoose method to register, login, logout the user, we use passport-local-mongoose as a middle-man to handle all of steps needed to save the data in the mongoose DB.

        User.register({username: req.body.username}, req.body.password, (err, user) => {
            if(!err){
                passport.authenticate("local")(req, res, () => {  //We will authenticate the user by using local authentication and redirect in the response to the our secrets route.
                    res.redirect("/secrets")
                })
            }
        })
- &nbsp; &nbsp; After sending user to the secrets route we will check if the user is authenticated by using req.isAuthenticated() method if is is true then we will render our secrets.ejs, Passport have a login() function on req that is used to establish the login session,

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
- &nbsp; &nbsp; To deAuthenticate the user passport have the method called as logout on req that used to terminate the session.

        req.logout((err) => {
            if(err){
                console.log(err);
            }
        });

### Level 6 auth:
- &nbsp; &nbsp; In this level we are using the concept of Open Authorization.
- &nbsp; &nbsp; Oauth allows :
    1. You to granular level of access:- When ur user login from another organization lets take example of facebook, in this case you can request specific things from the facebook account for example only profile and the friend list of that particular person. So in simple words developer can request what kind of data they want to access
    1. You to read/read&write access:- This means you can either just read or retrieve the data from facebook or you can post or write any post on that users account.
    1. revoke access:-3rd party application can revoke access at any point of time, in this case 3rd party application is facebook
