/*/////////////////////////////////////////////////

Final Project for NYCDA x BSSA course jan-march 2016

If you could 

to do:

- check restful routes
- email system - validation
- edit and delete user / advice
- semi random generator of advice
- when registering error, how to just show the error without deleting 
	all that has been typed..like when you already typed a long story in 
	'advice' you don't want  to lose that
- what if someone forgot their password?
 
/////////////////////////////////////////////////*/

var express = require('express');
var bodyParser = require('body-parser');
var sequelize = require('sequelize');
var session = require('express-session');
var bcrypt = require('bcrypt');
var sassMiddleware = require('node-sass-middleware');
var path = require('path');
var Promise = require('promise');
var sendgrid = require('sendgrid')(process.env.SENDGRID_API_KEY);

var app = express();

app.use(
	sassMiddleware({
		src: __dirname + '/sass',
		dest: __dirname + '/public',
		debug: true,
	})
);

app.use(express.static(path.join(__dirname, 'public')));

// app.use(express.static(__dirname + '/public'));

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
	},
	age: Sequelize.INTEGER,
	password: {
		type: Sequelize.TEXT,
		allowNull: false
	},
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
	response.render('login', {
		message: request.query.message,
		user: request.session.user
	});
})

// Register 

app.get('/user/new', function(request, response) {
	response.render('register', {
		message: request.query.message,
		user: request.session.user
	});
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

app.get('/user/choice', function(request, response) {
	var user = request.session.user;
	response.render('userchoice')
})

// Themed user pages

app.get('/userpageAu', function(request, response) {
	var user = request.session.user;
	var randomQuote = "";

	if (user === undefined) {
		response.redirect('/?message=' + encodeURIComponent("please log in to view your user page."));
	}

	User.max('id').then(function(advice) {
		randomQuote = User.advice;
	}).then(function() {
		response.render('userpageAu', {
			user: user,
			randomQuote: randomQuote
		});
		// console.log(randomQuote)
	});
});

app.get('/userpageWi', function(request, response) {
	var user = request.session.user;

	if (user === undefined) {
		response.redirect('/?message=' + encodeURIComponent("please log in to view your user page."));
	} else {
		response.render('userpageWi', {
			user: user
		})
	}
});

app.get('/userpageSp', function(request, response) {
	var user = request.session.user;

	if (user === undefined) {
		response.redirect('/?message=' + encodeURIComponent("please log in to view your user page."));
	} else {
		response.render('userpageSp', {
			user: user
		})
	}
});

app.get('/userpageSu', function(request, response) {
	var user = request.session.user;

	if (user === undefined) {
		response.redirect('/?message=' + encodeURIComponent("please log in to view your user page."));
	} else {
		response.render('userpageSu', {
			user: user
		})
	}
});

// User profile

app.get('/user/profile', function(request, response) {
	var user = request.session.user;

	if (user === undefined) {
		response.redirect('/?message=' + encodeURIComponent("please log in to view your user page."));
	} else {
		response.render('userprofile', {
			user: user,
			message: request.query.message
		})
	}
});

// Login  

app.post('/login', function(request, response) {
	var password = request.body.password;
	var message = request.query.message;

	User.findOne({
		where: {
			name: request.body.name
		}
	}).then(function(user) {
			if (user === undefined) {
				response.redirect('/login?message=' + encodeURIComponent("please log in to view your profile."));
			}
			if (user === null) {
				response.redirect('/login?message=' + encodeURIComponent("please register below before logging in"));

			} else if (request.body.name.length === 0) {
				response.redirect('/login?message=' + encodeURIComponent("please enter a name"));
			} else if (password.length === 0) {
				response.redirect('/login?message=' + encodeURIComponent("please enter a password"));
			} else if (user !== null && password.length !== 0) {
				bcrypt.compare(password, user.password, function(err, passwordMatch) {
					if (err) {
						console.log("Error with bcrypt")
					}
					if (passwordMatch) {
						request.session.user = user;
						response.redirect('/user/choice');
					} else {
						response.redirect('/login?message=' + encodeURIComponent("name or password incorrect, try again!"))
					}
				})
			}
		},
		function(error) {
			response.redirect('/?message=' + encodeURIComponent("an error occurred, try logging in again or register below"));
		});
});

// New User  > email is sent, but no validation via email link yet


app.post('/user/new', function(request, response) {
	var user = request.session.user;
	var message = request.query.message;

	bcrypt.hash(request.body.password, 8, function(err, passwordHash) {
		if (err !== undefined) {
			console.log(err);
		}
		if (request.body.name.length === 0 || request.body.email.length === 0 || request.body.password.length === 0) {
			response.redirect('/user/new?message=' + encodeURIComponent("please enter a name, emailaddress and a password"));
		}
		if (request.body.age < 12 || request.body.age > 110) {
			response.redirect('/user/new?message=' + encodeURIComponent("I'm sorry, you must be 12 or older to enter this website"));
		} else {
			User.create({
				name: request.body.name,
				email: request.body.email,
				age: request.body.age,
				password: passwordHash,
				advice: request.body.advice
			}).then(function() {
				var payload = {
					to: request.body.email,
					from: 'loetromijn@gmail.com',
					subject: 'Registration: If you could',
					text: 'Welcome, thank you for registering. Login to edit or add your own advice and view the latest or a random advice. If you have any questions, suggestions or anything else you would like to share with me, just click reply.'
				}
				var user = request.session.user;
				sendgrid.send(payload, function(err, user) {
						if (err) {
							return console.error(err);
						} else {
							response.redirect('/user/new/advice?message=' + encodeURIComponent("An email has been sent to you. Please login"));
						}
					}),
					function(error) {
						response.redirect('/user/new?message=' + encodeURIComponent("name or email already in use, try something else!"));
					}
			});
		};
	});
});

// New user advice

app.get('/user/new/advice', function(request, response) {
	var user = request.session.user;
	response.render('advice', {
		user: user
	})
})

app.post('/user/new/advice', function(request, response) {
	var user = request.session.user;

	if (request.body.advice.length !== 0) {
		User.create({
			advice: request.body.advice
		}, {
			where: {
				id: user.id
			}
		}).then(function() {
			response.redirect('/user/choice')
		});
	};
});


// Edit user      - after editing, changes are confirmed but not yet showing on the profile page    

app.get('/user/edit', function(request, response) {
	var user = request.session.user;
	response.render('useredit', {
		user: user
	});
})

app.post('/user/edit', function(request, response) {
	var user = request.session.user;

	var promiseArray = [];

	if (user === undefined) {
		response.redirect('/?message=' + encodeURIComponent("please log in to view your profile."));
	}
	if (request.body.name.length !== 0 || request.body.name !== user.name) {
		promiseArray.push(User.update({
			name: request.body.name,
		}, {
			where: {
				id: user.id
			}
		}));
	}
	if (request.body.email.length !== 0 || request.body.email !== user.email) {
		promiseArray.push(User.update({
			email: request.body.email,
		}, {
			where: {
				id: user.id
			}
		}));
	}
	if (request.body.age.length !== 0 || request.body.age !== user.age) {
		promiseArray.push(User.update({
			age: request.body.age,
		}, {
			where: {
				id: user.id
			}
		}));
	}
	if (request.body.advice.length !== 0 || request.body.advice !== user.advice) {
		promiseArray.push(User.update({
			advice: request.body.advice,
		}, {
			where: {
				id: user.id
			}
		}));
	}

	Promise.all(promiseArray).then(function() {
		response.redirect('/user/profile?message=' + encodeURIComponent("Changes confirmed"));
	});
});


// Edit password

app.get('/user/editpassword', function(request, response) {
	var user = request.session.user;
	response.render('usereditpassword', {
		user: user
	});
})

app.post('/user/editpassword', function(request, response) {
	var user = request.session.user;

	var promiseArray = [];

	if (user === undefined) {
		response.redirect('/?message=' + encodeURIComponent("please log in to view your profile."));
	}

	if (request.body.password.length !== 0) {
		bcrypt.hash(request.body.password, 8, function(err, passwordHash) {
			if (err !== undefined) {
				console.log(err);
			}
			promiseArray.push(User.update({
				password: passwordHash,
			}, {
				where: {
					id: user.id
				}
			}));
		});
	}
	Promise.all(promiseArray).then(function() {
		response.redirect('/user/profile?message=' + encodeURIComponent("Changes confirmed"));
	});
});

// Delete user

app.get('/user/delete', function(request, response) {
	var user = request.session.user;
	response.render('delete')

})

app.post('/user/delete', function(request, response) {
	var user = request.session.user;

	User.destroy({
		where: {
			id: user.id
		}
	}).then(function() {
		response.redirect('/?message=' + encodeURIComponent("Sorry to see you go, you can come back any time!"))
	});
});


// Sync database, then start server 

var port = Number(process.env.PORT || 3000); // proces.env.PORT check

sequelize.sync().then(function() {
	var server = app.listen(port, function() {
		console.log('Ifyoucould final project running on port 3000');
	});
});