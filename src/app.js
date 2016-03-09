/*/////////////////////////////////////////////////

Final Project for NYCDA x BSSA course jan-march 2016

If you could 

to do:

- check restful routes
- boxes four choices that all render different css style for the userpage
- email system - validation + unsubscribe
- edit and delete user / advice
- semi random generator of advice
 
/////////////////////////////////////////////////*/

var express = require('express');
var bodyParser = require('body-parser');
var sequelize = require('sequelize');
var session = require('express-session');
var bcrypt = require('bcrypt');

var app = express();

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(session({
	secret: 'extremely secret stuff here',
	resave: true,
	saveUninitialized: false
}));

app.set('views', './src/views');
app.set('view engine', 'jade');

// Sequelize settings

var Sequelize = require('sequelize');
var sequelize = new Sequelize('ifyoucould', process.env.POSTGRES_USER, null, {
	host: 'localhost',
	dialect: 'postgres',
	define: {
		timestamps: false
	}
});

// Sequelize User model

var User = sequelize.define('users', {
	name: {
		type: Sequelize.TEXT,
		allowNull: false,
		unique: true
	},
	email: {
		type: Sequelize.TEXT,
		allowNull: false,
		unique: true
	},
	age: Sequelize.INTEGER,
	password: Sequelize.TEXT,
	advice: Sequelize.TEXT
});


//Routes 

// Homepage

app.get('/', function(request, response) {
	response.render('index', {
		message: request.query.message,
		user: request.session.user
	});
});

// Login 

app.get('/login', function(request, response) {
	response.render('login');
})

// Register 

app.get('/user/new', function(request, response) {
	response.render('register');
})

// Logout

app.get('/logout', function(request, response) {
	request.session.destroy(function(error) {
		if (error) {
			throw error;
		}
		response.render('logout');
	});
});

// Page that gives client four options

app.get('/user/choice', function(request, response){
	var user = request.session.user;
	response.render('userchoice')
})

// User page

app.get('/user/page', function(request, response) {
	var user = request.session.user;

	if (user === undefined) {
		response.redirect('/?message=' + encodeURIComponent("please log in to view your user page."));
	} else {
		response.render('userpage', {
			user: user
		})
	}
});

// User profile

app.get('/user/profile', function(request, response) {
	var user = request.session.user;
	response.render('userprofile', {
		user: user
	})
});


// Login  

app.post('/login', function(request, response) {
	var password = request.body.password;
	User.findOne({
		where: {
			name: request.body.name
		}
	}).then(function(user) {
			if (user === undefined) {
				response.redirect('/?message=' + encodeURIComponent("please log in to view your profile."));
			}
			if (user === null) {
				response.redirect('/?message=' + encodeURIComponent("please register below before logging in"));

			} else if (request.body.name.length === 0) {
				response.redirect('/?message=' + encodeURIComponent("please enter a name"));
			} else if (password.length === 0) {
				response.redirect('/?message=' + encodeURIComponent("please enter a password"));
			} else if (user !== null && password.length !== 0) {
				bcrypt.compare(password, user.password, function(err, passwordMatch) {
					if (err) {
						console.log("Error with bcrypt")
					}
					if (passwordMatch) {
						request.session.user = user;
						response.redirect('/user/choice');
					} else {
						response.redirect('/?message=' + encodeURIComponent("name or password incorrect, try again!"))
					}
				})
			}
		},
		function(error) {
			response.redirect('/?message=' + encodeURIComponent("an error occurred, try logging in again or register below"));
		});
});

// New User  > validation email


app.post('/user/new', function(request, response) {
	var user = request.session.user;

	bcrypt.hash(request.body.password, 8, function(err, passwordHash) {
		if (err !== undefined) {
			console.log(err);
		}
		if (request.body.name.length === 0 || request.body.email.length === 0 || request.body.password.length === 0) {
			response.redirect('/?message=' + encodeURIComponent("please enter a name, emailaddress and a password"));
		}
		if(request.body.age < 12){
			response.redirect('/?message=' + encodeURIComponent("I'm sorry, you must be 12 or older to enter this website"));
		} else {
			User.create({
				name: request.body.name,
				email: request.body.email,
				age: request.body.age,
				password: passwordHash,
				advice: request.body.advice
			}).then(function(user) {
					response.redirect('/user/page');
				},
				function(error) {
					response.redirect('/?message=' + encodeURIComponent("name or email already in use, try something else!"));
				});
		};
	});
});

// Edit

// app.post('/user/edit', function(request, response) {
// 	var user = request.session.user;

// 	
// 	}).then(function() {
// 		response.redirect('/user/page');
// 	});
// });



// Sync database, then start server 

sequelize.sync().then(function() {
	var server = app.listen(3000, function() {
		console.log('Ifyoucould final project running on port 3000');
	});
});