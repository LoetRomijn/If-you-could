/*/////////////////////////////////////////////////

Final Project for NYCDA x BSSA course jan-march 2016

If you could 

to improve:

- validation by email
- postgres order of entries, check sort by timestamps
- clean up code by writing 'find random advice' query into a function
 
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
	// timeStamp: Sequelize.DATE
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

// Themed user pages incl latest advice + random function

app.get('/userpageAu', function(request, response) {
	var user = request.session.user;
	var position = request.session.position;

	if (user === undefined) {
		response.redirect('/?message=' + encodeURIComponent("please log in to view your user page."));
	}

	if (position === undefined) {
		User.findAll().then(function(users) {
			var allIDs = users.map(function(users) {
				return {
					id: users.dataValues.id,
					age: users.dataValues.age,
					advice: users.dataValues.advice
				}
			});

			var latestID = allIDs[allIDs.length - 1];

			request.session.position = latestID.id;

			response.render('userpageAu', {
				user: user,
				latestID: latestID,
			});
		});
		return;
	} else {
		User.findAll().then(function(users) {
			var allIDs = users.map(function(users) {
				return {
					id: users.dataValues.id,
					age: users.dataValues.age,
					advice: users.dataValues.advice
				}
			});

			User.findOne({
				where: {
					id: position
				}
			}).then(function(user) {
				latestID = user;

				position = allIDs[Math.floor(Math.random() * allIDs.length)].id;

				while (position === latestID.id) {
					position = allIDs[Math.floor(Math.random() * allIDs.length)].id;
				}

				User.findOne({
					where: {
						id: position
					}
				}).then(function(user) {
					latestID = user;
					request.session.position = latestID.id;

					response.render('userpageAu', {
						user: user,
						latestID: latestID,
					});

				})

				return;

			});
		});
	};
});



app.get('/userpageWi', function(request, response) {
	var user = request.session.user;
	var position = request.session.position;

	if (user === undefined) {
		response.redirect('/?message=' + encodeURIComponent("please log in to view your user page."));
	}

	if (position === undefined) {
		User.findAll().then(function(users) {
			var allIDs = users.map(function(users) {
				return {
					id: users.dataValues.id,
					age: users.dataValues.age,
					advice: users.dataValues.advice
				}
			});
			var latestID = allIDs[allIDs.length - 1];

			request.session.position = latestID.id;

			response.render('userpageWi', {
				user: user,
				latestID: latestID,
			});
		});
		return;
	} else {
		User.findAll().then(function(users) {
			var allIDs = users.map(function(users) {
				return {
					id: users.dataValues.id,
					age: users.dataValues.age,
					advice: users.dataValues.advice
				}
			});

			User.findOne({
				where: {
					id: position
				}
			}).then(function(user) {
				latestID = user;

				position = allIDs[Math.floor(Math.random() * allIDs.length)].id;

				while (position === latestID.id) {
					position = allIDs[Math.floor(Math.random() * allIDs.length)].id;
				}

				User.findOne({
					where: {
						id: position
					}
				}).then(function(user) {
					latestID = user;
					request.session.position = latestID.id;
					response.render('userpageWi', {
						user: user,
						latestID: latestID,
					});

				})

				return;

			});
		});
	};
});

app.get('/userpageSp', function(request, response) {
	var user = request.session.user;
	var position = request.session.position;

	if (user === undefined) {
		response.redirect('/?message=' + encodeURIComponent("please log in to view your user page."));
	}

	if (position === undefined) {
		User.findAll().then(function(users) {
			var allIDs = users.map(function(users) {
				return {
					id: users.dataValues.id,
					age: users.dataValues.age,
					advice: users.dataValues.advice
				}
			});
			var latestID = allIDs[allIDs.length - 1];

			request.session.position = latestID.id;

			response.render('userpageSp', {
				user: user,
				latestID: latestID,
			});
		});
		return;
	} else {
		User.findAll().then(function(users) {
			var allIDs = users.map(function(users) {
				return {
					id: users.dataValues.id,
					age: users.dataValues.age,
					advice: users.dataValues.advice
				}
			});

			User.findOne({
				where: {
					id: position
				}
			}).then(function(user) {
				latestID = user;

				position = allIDs[Math.floor(Math.random() * allIDs.length)].id;

				while (position === latestID.id) {
					position = allIDs[Math.floor(Math.random() * allIDs.length)].id;
				}

				User.findOne({
					where: {
						id: position
					}
				}).then(function(user) {
					latestID = user;
					request.session.position = latestID.id;
					response.render('userpageSp', {
						user: user,
						latestID: latestID,
					});

				})

				return;

			});
		});
	};
});

app.get('/userpageSu', function(request, response) {
	var user = request.session.user;
	var position = request.session.position;

	if (user === undefined) {
		response.redirect('/?message=' + encodeURIComponent("please log in to view your user page."));
	}

	if (position === undefined) {
		User.findAll().then(function(users) {
			var allIDs = users.map(function(users) {
				return {
					id: users.dataValues.id,
					age: users.dataValues.age,
					advice: users.dataValues.advice
				}
			});
			var latestID = allIDs[allIDs.length - 1];

			request.session.position = latestID.id;

			response.render('userpageSu', {
				user: user,
				latestID: latestID,
			});
		});
		return;
	} else {
		User.findAll().then(function(users) {
			var allIDs = users.map(function(users) {
				return {
					id: users.dataValues.id,
					age: users.dataValues.age,
					advice: users.dataValues.advice
				}
			});

			User.findOne({
				where: {
					id: position
				}
			}).then(function(user) {
				latestID = user;

				position = allIDs[Math.floor(Math.random() * allIDs.length)].id;

				while (position === latestID.id) {
					position = allIDs[Math.floor(Math.random() * allIDs.length)].id;
				}

				User.findOne({
					where: {
						id: position
					}
				}).then(function(user) {
					latestID = user;
					request.session.position = latestID.id;
					response.render('userpageSu', {
						user: user,
						latestID: latestID,
					});

				})

				return;

			});
		});
	};
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
						if (user.advice === null) {
							request.session.user = user;
							response.redirect('/user/new/advice');
						} else if (user.advice !== null) {
							request.session.user = user;
							response.redirect('/user/choice');
						}
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
		} else if (request.body.age < 12 || request.body.age > 110) {
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
					text: 'Welcome,\n\n\n' +
						'Thank you for registering.\n' +
						'Login to edit or add your own advice and view the latest or a random advice.\n' +
						'If you have any questions, suggestions or anything else you would like to share with me, just click reply.\n\n' +

						'Your username = ' + request.body.name + '\n\n' +

						'Your password = ' + request.body.password + '\n'
				}
				var user = request.session.user;
				sendgrid.send(payload, function(err, user) {
						if (err) {
							return console.error(err);
						} else {
							response.redirect('/?message=' + encodeURIComponent("An email has been sent to you. Please login"));
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
		user: request.session.user
	})
})

app.post('/user/new/advice', function(request, response) {
	var user = request.session.user;

	if (request.body.advice.length !== 0) {
		User.update({
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


// Edit user      - after editing, changes are confirmed but not yet immediately showing on the profile page    

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

// Lost password, new password

app.get('/user/lostpasswordmail', function(request, response) {
	// var message = request.query.message;

	response.render('userlostpasswordmail', {
		message: request.query.message
	});
});

app.post('/user/lostpasswordmail', function(request, response) {
	var name = request.body.name;
	var email = request.body.email;

	User.findOne({
		where: {
			name: name,
			email: email
		}
	}).then(function(user) {
		if (user === null || request.body.email.length === 0 || request.body.name.length === 0) {
			response.redirect('/user/lostpasswordmail/?message=' + encodeURIComponent("Name or email invalid, try again."));
			return;
		}
		var link = 'http://' + request.headers.host + '/user/lostpassword/' + user.id;
		var payload = {
			to: email,
			from: 'loetromijn@gmail.com',
			subject: 'Registration: If you could',
			text: 'Hi,\n\n\n' +
				'Seems like you lost your password. Click the link below.\n' +
				link
		}

		sendgrid.send(payload, function(err) {
			if (err) {
				return console.error(err);
			} else {
				response.redirect('/?message=' + encodeURIComponent("An email has been sent to you. Please click the link in the email"));
			}
		});
	});
});


app.get('/user/lostpassword/:id', function(request, response) {
	response.render('userlostpassword', {
		message: request.query.message,
		id: request.params.id
	});
});

app.post('/user/lostpassword/:id', function(request, response) {


	if (request.params.id === undefined) {
		response.redirect('/user/lostpasswordmail/?message=' + encodeURIComponent("Oops, something went wrong..try again."));
	} else if (request.body.password.length === 0 || request.body.password === "new password") {
		response.redirect('/user/lostpassword/' + request.params.id + '/?message=' + encodeURIComponent("Please enter a password"));
	} else {
		bcrypt.hash(request.body.password, 8, function(err, passwordHash) {
			if (err !== undefined) {
				console.log(err);
			}
			User.update({
				password: passwordHash,
			}, {
				where: {
					id: request.params.id
				}
			});
		});
		response.redirect('/?message=' + encodeURIComponent("Login with your new password"));
	}
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

