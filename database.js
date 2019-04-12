//Require SPICED PG//
var spicedPg = require('spiced-pg');
var db = spicedPg(process.env.DATABASE_URL ||'postgres:postgres:postgres@localhost:5432/my-petition');
//---//

//Require bcrypt for hashing//
const bcrypt = require("bcryptjs");
const {promisify} = require('util');
const genSalt = promisify(bcrypt.genSalt);
const hash = promisify(bcrypt.hash);
const compare = promisify(bcrypt.compare);
//---//

//Add row to signers DB table//
module.exports.submitSignature = function submitSignature(signature, users_id) {
    return db.query(`INSERT INTO signers (signature, users_id)
    VALUES ($1, $2)`, [signature, users_id]);
};
//---//

//Add row to signers DB table//
module.exports.getSignatureID = function getSignatureID(users_id) {
    return db.query(`SELECT id
        FROM signers
        WHERE users_id = $1`, [users_id]);
};
//---//

//Display signers//
module.exports.displaySigners = function displaySigners() {
    return db.query(`SELECT users.firstName, users.surname, profiles.age, profiles.city, profiles.website
        FROM users
        JOIN signers
        ON users.id = signers.users_id
        LEFT JOIN profiles
        ON users.id = profiles.user_id`);
};
//---//

//Display number of signers//
module.exports.numberOfSigners = function numberOfSigners() {
    return db.query(`SELECT COUNT(*)
    FROM signers`);
};
//---//

//Display signers in a particular city//
module.exports.displaySignersInCity = function displaySignersInCity(city) {
    return db.query(`SELECT users.firstName, users.surname, profiles.age, profiles.city, profiles.website
        FROM users JOIN signers ON users.id = signers.users_id
        LEFT JOIN profiles
        ON users.id = profiles.user_id
        WHERE LOWER(city) = LOWER($1)`, [city]);
};
//---//

//Display signature//
module.exports.displaySignature = function displaySignature(users_id) {
    return db.query(`SELECT signature
        FROM signers
        WHERE users_id = $1`, [users_id]);
};
//---//

//Hash password//
module.exports.pwordHash = function pwordHash(randomPword) {
    return genSalt().then(
        salt => {
            return hash(randomPword, salt);
        }
    ).then(
        hash => {
            return hash;
        }
    );
};
//---//

//Compare passwords//
module.exports.pwordCompare = function pwordCompare(inputPword, hashedPword) {
    return compare(inputPword, hashedPword);
};
//---//

//Register new user//
module.exports.registerUser = function registerUser(firstName, surname, email, password) {
    return db.query(`INSERT INTO users (firstName, surname, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id`, [firstName, surname, email, password]);
};
//---//

//Add info to profile//
module.exports.fillProfile = function fillProfile(age, city, website, user_id) {
    return db.query(`INSERT INTO profiles (age, city, website, user_id)
        VALUES ($1, $2, $3, $4)`, [age, city, website, user_id]);
};
//---//

//Check if an email is in the database//
module.exports.isMailInDB = function isMailInDB(email) {
    return db.query(`SELECT email
        FROM users
        WHERE LOWER(email) = LOWER($1)`, [email]);
};
//---//

//Get all info from a user//
module.exports.allUserInfo = function allUserInfo(email) {
    return db.query(`SELECT users.id as u_id, profiles.id as p_id, signers.id as s_id, users.firstName, users.surname, users.email, users.password, profiles.age, profiles.city, profiles.website, signers.signature
        FROM users
        LEFT JOIN signers
        ON users.id = signers.users_id
        LEFT JOIN profiles
        ON users.id = profiles.user_id
        WHERE LOWER(email) = LOWER($1)`, [email]);
};
//---//

//Get user profile for settings//
module.exports.getProfile = function getProfile(user_id) {
    return db.query(`SELECT users.id, users.firstName, users.surname, users.email, profiles.age, profiles.city, profiles.website
        FROM users
        LEFT JOIN profiles ON users.id = profiles.user_id
        WHERE users.id = $1`, [user_id]);
};
//---//

//Change user settings//
module.exports.modifyUsersWoutPword = function modifyUsersWoutPword(firstName, surname, email, user_id) {
    return db.query(`UPDATE users
        SET firstName = $1, surname = $2, email = $3
        WHERE users.id = $4`,[firstName, surname, email, user_id]
    );
};

module.exports.modifyUsersWithPword = function modifyUsersWithPword(firstName, surname, email, password, user_id) {
    return db.query(`UPDATE users
        SET firstName = $1, surname = $2, email = $3, password = $4
        WHERE users.id = $5`,[firstName, surname, email, password, user_id]
    );
};
//---//

//Change profile settings//
module.exports.modifyProfiles = function modifyProfiles(age, city, website, user_id) {
    return db.query(`INSERT INTO profiles (age, city, website, user_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id)
        DO UPDATE SET age = $1, city = $2, website = $3`, [age, city, website, user_id]);
};
//---//

//Erase signature//
module.exports.eraseSignature = function eraseSignature(user_id) {
    return db.query(`DELETE FROM signers
        WHERE users_id = $1`, [user_id]);
};
//---//
