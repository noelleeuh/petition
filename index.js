//Set server//
const express = require('express');
const app = express();
//---//

//Import database.js//
const db = require('./database');
//---//

//Import cookie session//
const cookieSession = require('cookie-session');
//---//

//Import CSURF//
const csurf = require('csurf');
//---//

//Express handlebars//
var hb = require('express-handlebars');
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');
//---//

//Activate parsers//
app.use(
    require('body-parser').urlencoded({
        extended: false
    })
);

app.use(require('cookie-parser')());
//---//

//Grant access to the folder Assets//
app.use(
    express.static('./assets')
);
//---//

//Activate cookie session//
app.use(
    cookieSession({
        secret: 'Unicorn cookies are the best',
        maxAge: 1000 * 60 * 60 * 24 * 14 //Cookies last for 2 weeks
    })
);
//---//

//Activate csurf//
app.use(csurf());
//---//

//Add security measures//
app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY'); //To prevent XSS
    res.locals.csrfToken = req.csrfToken();//To prevent CSRF
    next();
});
//---//

/////////////////////////////////////////////////////////////////////

app.use((req, res, next) => {
    if (!req.session.userID && req.url != '/registration' && req.url != '/login') {
        res.redirect('/registration');
    } else {
        next();
    }
});

function needUserOut(req, res, next) {
    if (req.session.userID) {
        res.redirect("/petition");
    } else {
        next();
    }
}

function needUnsigned(req, res, next) {
    if (req.session.signatureID) {
        res.redirect("/thanks");
    } else {
        next();
    }
}

function needToBeSigned(req, res, next) {
    if (!req.session.signatureID) {
        res.redirect("/petition");
    } else {
        next();
    }
}

//Render the petition page//
app.get('/petition', needUnsigned, function(req, res) {
    res.render('powerful_signature', {
        layout: 'unicorn'
    });
});
//---//

//Render the petition page//
app.get('/petition/error', needUnsigned, function(req, res) {
    res.render('powerful_signature', {
        layout: 'unicorn'
    });
});
//---//

//Insert signature into data base and redirect to the /thanks page//
app.post('/petition', needUnsigned, (req, res) => {
    return db.submitSignature(req.body.signature,req.session.userID).then(data => {
        // if (req.body.signature != '') {
        db.getSignatureID(req.session.userID).then(data => {
            req.session.signatureID = data.rows[0].id;
            res.redirect('/thanks');
        }).catch(function(err) {
            console.log(err);
        });
        // } else {
        //     res.render('powerful_signature_error', {
        //         layout: 'unicorn'
        //     });
        // }
    });
});
//---//

//Render the 'thank you' page//
app.get('/thanks', needToBeSigned, (req, res) => {
    Promise.all([db.displaySignature(req.session.userID), db.numberOfSigners()]).then(data => {
        res.render('thank_you_next', {
            layout: 'unicorn',
            signers: data[0].rows,
            voters: data[1].rows[0].count
        });
    });
});
//---//

//List first and last names of everyone who has signed the petition//
app.get('/signers', needToBeSigned, (req, res) => {
    return db.displaySigners().then(data => {
        res.render('awesome_people', {
            layout: 'unicorn',
            signers: data.rows
        });
    });
});
//---//

//List first and last names of everyone who has signed the petition in a particular city//
app.get('/signers/:city', needToBeSigned, (req, res) => {
    return db.displaySignersInCity(req.params.city).then(data => {
        //console.log("Available :", data);
        res.render('awesome_people_city', {
            layout: 'unicorn',
            signers: data.rows,
            city: req.params.city
        });
    });
});
//---//

//Render the registration page//
app.get('/registration', needUserOut, function(req, res) {
    res.render('join_the_cult', {
        layout: 'unicorn'
    });
});
//---//

//Hash password with bcrypt, then insert data to DB//
app.post('/registration', needUserOut, (req, res) => {
    if (req.body.password != '') {
        db.pwordHash(req.body.password).then(hashedInput => {
            return db.registerUser(req.body.firstName, req.body.surname, req.body.email, hashedInput).then(data => {
                req.session.firstName = req.body.firstname;
                req.session.surname = req.body.surname;
                req.session.email = req.body.email;
                req.session.password = hashedInput;
                req.session.userID = data.rows[0].id;
                if (req.body.firstName == '' || req.body.surname == '' || req.body.signature == '') {
                    res.render('join_the_cult_error', {
                        layout: 'unicorn'
                    });
                } else {
                    res.redirect('/profile');
                }
            });
        });
    } else {
        res.render('join_the_cult_error', {
            layout: 'unicorn'
        });
    }
});
//---//

//Render the login page//
app.get('/login', needUserOut, function(req, res) {
    res.render('enter_the_cult', {
        layout: 'unicorn'
    });
});
//---//

//Check if email exists in the data base. If so, compare password//
app.post('/login', needUserOut, (req, res) => {
    if (req.body.email != '' && req.body.password != '') {
        db.isMailInDB(req.body.email).then(data => {
            if (data.rowCount == 1) {
                db.allUserInfo(req.body.email).then(data => {
                    req.session.firstName = data.rows[0].firstname;
                    req.session.surname = data.rows[0].surname;
                    req.session.email = data.rows[0].email;
                    req.session.password = data.rows[0].password;
                    req.session.age = data.rows[0].age;
                    req.session.city = data.rows[0].city;
                    req.session.website = data.rows[0].website;
                    req.session.userID = data.rows[0].u_id;
                    req.session.signatureID = data.rows[0].s_id;
                    db.pwordCompare(req.body.password, data.rows[0].password).then(bool => {
                        if (bool == true) {
                            if (req.session.signatureID != null) {
                                res.redirect('/thanks');
                            } else {
                                res.redirect('/petition');
                            }
                        } else {
                            req.session = null;
                            res.render('enter_the_cult_error_pword', {
                                layout: 'unicorn'
                            });
                        }
                    });
                });
            } else if (data.rowCount == 0) {
                res.render('enter_the_cult_error_email', {
                    layout: 'unicorn'
                });
            }
        });
    } else {
        res.render('enter_the_cult_error_general', {
            layout: 'unicorn'
        });
    }
});
//---//

//Log out of the site//
app.get("/logout", function(req, res) {
    req.session = null;
    res.redirect("/registration");
});
//---//

//Render the profile page//
app.get('/profile', function(req, res) {
    var profileCreated = 'age' in req.session;
    // console.log(testArray);
    if (profileCreated == false) {
        res.render('share_the_deets', {
            layout: 'unicorn'
        });
    } else {
        res.redirect('/petition');
    }
});
//---//

//Profile is optional//
app.post('/profile',(req, res) => {
    if (req.body.website != '') {
        if (req.body.website.startsWith("https://") || req.body.website.startsWith("http://")) {
        } else {
            req.body.website = 'https://' + req.body.website;
        }
    }
    return db.fillProfile(Number(req.body.age), req.body.city, req.body.website, req.session.userID).then(data => {
        req.session.age = req.body.age;
        req.session.city = req.body.city;
        req.session.website = req.body.website;
        res.redirect('/petition');
    });
});
//---//

//Render change settings page//
app.get('/settings',(req, res) => {
    db.getProfile(req.session.userID).then(data => {
        res.render('change_the_deets', {
            layout: 'unicorn',
            fname: data.rows[0].firstname,
            sname: data.rows[0].surname,
            mail: data.rows[0].email,
            pword: data.rows[0].password,
            age: data.rows[0].age,
            city: data.rows[0].city,
            wsite: data.rows[0].website
        });
    });
});
//---//

//Change settings//
app.post('/settings',(req, res) => {
    if (req.body.password) {
        db.pwordHash(req.body.password).then(hashedInput => {
            Promise.all([
                db.modifyUsersWithPword(req.body.firstName,req.body.surname,req.body.email,hashedInput,req.session.userID),
                db.modifyProfiles(req.body.age,req.body.city,req.body.website,req.session.userID)
            ]).then(data => {
                res.redirect('/settings');
            });
        });
    } else {
        Promise.all([
            db.modifyUsersWoutPword(req.body.firstName,req.body.surname,req.body.email,req.session.userID),
            db.modifyProfiles(req.body.age,req.body.city,req.body.website,req.session.userID)
        ]).then(data => {
            res.redirect('/settings');
        });
    }
});
//---//

//Erase signature//
app.post('/thanks', needToBeSigned, (req, res) => {
    db.eraseSignature(req.session.userID).then(data => {
        req.session.signatureID = null;
        res.redirect("/petition");
    });
});
//---//

//Server//
app.listen(process.env.PORT || 8080, () => console.log('Server listening!'));
//---//
