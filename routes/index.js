var express = require('express');
var passport = require('passport');
var router = express.Router();
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var User = require('../models/user');

var env = {
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback'
};

//Home page
router.get('/', ensureLoggedIn, function(req, res, next) {
  res.render('index', { title: 'Express', env: env, user: req.user });
});

//login
router.get('/login', function(req, res){
  console.log("LOGIN IN")
  res.render('login', { title: 'Express', env: env });
});


//logout
router.get('/logout', function(req, res){
  console.log("BYE now")
  req.logout();
  res.redirect('/');
});

//all sitters but still need to filter for SITTERS ONLY in right city in Find params
router.get('/users', function(req, res, next) {
  User.find({}, function(err, users){
    res.json(users);
  });
});

//update profile info
router.patch('/:id/upvote', function(req, res, next){
  Joke.findByIdAndUpdate(req.params.id, { $inc: { upvotes: 1 }}, function(err, joke) {
    if (err) console.log(err);
    res.json(joke);
  });
})

//the signingin and saving of it all
router.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/url-if-something-fails' }),
  function(req, res) {
    User.findOne({ auth_id: req.user.id }, function(err, user) {
      if (err) console.log(err);
      if (!user){
        var newUser = User({
          auth_id: req.user.id,
          nickname: req.user.nickname
        });
        newUser.save(function(err, user){
          if (err) console.log(err);
        });
      }
      res.redirect(req.session.returnTo || '/');
    });
  });


module.exports = router;
