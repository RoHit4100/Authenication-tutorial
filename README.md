
# Authentication Levels

This is the repository to help in Authentication for any website or any application, Anyone can gothrough this code and learn how to implement the authentication from various levels.

This project is for the forks who are looking to learn authentication for there personal projects and wants to implement very secure webApp or website.




## Different Levels

### Level 1 auth: 
- &nbsp; &nbsp;  In this level we just simply save the user data in DB & all the data present in the DB is save in the plane text, that is the major and the biggest issue for these level.
- &nbsp; &nbsp;  Anyone can get the access of the DB and the present in the DB may lead them to the price. To avoid these we need to push the data in the database by using various encryption techniques.
### Level 2 auth: 
- &nbsp; &nbsp; In these level we use encryption.
- &nbsp; &nbsp; For encyption we can use the mongoose-encryption package which use the Simple encryption and authentication for mongoose documents and relies on the Node crypto module. Encryption and decryption happen transparently during save and find. Rather than encrypting fields individually, this plugin takes advantage of the BSON nature of mongoDB documents to encrypt multiple fields at once.
- &nbsp; &nbsp; Encryption is performed using AES-256-CBC with a random, unique initialization vector for each operation. Authentication is performed using HMAC-SHA-512.
