var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer'); 

//PassportJS Auth headers
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');
var session = require('express-session');

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data

// ExpressJS Session before Passport's session
app.use(session({ secret: 'this is the secret' }));
app.use(cookieParser());
// Passport Session after Express's session
app.use(passport.initialize());
app.use(passport.session());

// Receive information and echo
/*
app.post("/login", function(req, res){
 	var user = req.body;
 	console.log(user);
 	res.json(user);
});
*/

var users = [
	{username: 'alice', password:'alice', firstName:'Alice'},
	{username: 'bob', password:'bob', firstName:'Vob'},
	{username: 'charlie', password:'charlie', firstName:'Charlie'},
];


/*
 * Methods Required for authentication by Passport
 */

// Passporth Authentication with LocalStrategy
passport.use(new LocalStrategy(function (username, password, done){
    
    // Successful: In case iterating over an array:
    for(var u in users){
    	if(username == users[u].username && password == users[u].password)
    	{
    		return done(null, users[u]); // First arg is any error, second is the desired
    									// user object
    	}
    }

    // Invalid Auth. with an Error message - ("null" indicates the error)
    return done(null, false, {message: 'Unable to login'});
}));

// To encrypt the object containing the session information
passport.serializeUser(function(user, done) {
    done(null, user);
});


// To decrypt the session information
passport.deserializeUser(function(user, done) {
    done(null, user);
});

/*
 * Methods Required for authentication by Passport
 */


// Using PassportJS as middle-ware in the request chain with a local(user-pass) strategy
app.post("/login", passport.authenticate('local'), function(req, res){
 	var user = req.user; //Since the user will be inserted into the body on successful 
 						 // auth or a false will be inserted
 	console.log(user);
 	res.json(user);
});

app.listen(3000);