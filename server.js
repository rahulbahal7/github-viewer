var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer'); 

//PassportJS Auth headers
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mongoose = require('mongoose');

//Connect to the database
var connectionString = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/test';
var db = mongoose.connect(connectionString);

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data

// ExpressJS Session before Passport's session
//Sign the session with a key
app.use(session({ secret: 'this is the secret' }));
app.use(cookieParser());
// Passport Session after Express's session
app.use(passport.initialize());
app.use(passport.session());


//Schema
var UserSchema  = new mongoose.Schema({
	username: String,
	password: String,
	repositories: [String],
	followers: Number,
	following: Number
}, {collection: 'usermodels'});


//Model
var UserModel = mongoose.model("UserModel", UserSchema);

/* Sample Entry

var rahul = new UserModel({
	username:'rahul7', password:'password', 
	repositories:['project1', 'project2'],
	followers: 5, following: 2
});

rahul.save();

*/

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
    // for(var u in users){
    // 	if(username == users[u].username && password == users[u].password)
    // 	{
    // 		return done(null, {username:username}); // First arg is any error, second is the desired
    // 									// user object
    // 	}
    UserModel.findOne({username: username, password: password}, function(err, user){
    	if(user){
    		return done(null, user)
    	}
    	// Invalid Auth. with an Error message - ("null" indicates the error)
    	return done(null, false, {message: 'Unable to login'});
    });

    
   
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


/*
 * Use Passport to intercept URL access
 */

var auth = function(req, res, next)
{
    if (!req.isAuthenticated())
        res.send(401);
    else
        next(); // Execute the next function or item in the execution chain
};


// Protect data - URL accessible only for authenticated users
app.get("/api/users", auth, function(req, res){
	res.json(users);
});


//Logout the user
app.post("/logout", function(req, res){
	req.logout();
	res.send(200); //Return Success
});


// Check if the user is authenticated before responding
app.get('/loggedin', function(req, res){
    res.send(req.isAuthenticated() ? req.user : '0');
});

//Register User
app.post("/register", function(req, res){

	//Check if the username already exists before creating new user
	var newUser = new UserModel(req.body);
	newUser.repositories = ['demoRepo'];
	newUser.save(function(err, user){
		//Login the user as it's valid now
		req.login(user, function(err){
			if(err){return next(err);}
			res.json(user);
		});
	});
});

//Add Following of the current user 
app.put("/follow/:u", function (req, res) {
    var user = req.user; //Since the user will be inserted into the body on successful 
    // auth or a false will be inserted\
    UserModel.findOneAndUpdate({"username": user.username}, { $addToSet: {"repositories": req.params.u}},
    	{upsert:true}, function(err, doc){
    		if (err) return res.send(500, { error: err });
    		return res.send("succesfully saved");
    	});
    UserModel.update({"username": "bob"}, { $addToSet: {"repositories": "aaaa"}})
    /*
    console.log(user);
    var following = req.params.u;
    console.log(following);
    UserModel.findOne({"username": user.username}, function(err, user){
    	if(user){
    		console.log("hello"+ user.username);
    		
    	}
    });
	*/
});


var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port  = process.env.OPENSHIFT_NODEJS_PORT || 3000 ;

app.listen(port, ip);