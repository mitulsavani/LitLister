const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const { Auth } = require('../database/api');

const checkPassword = function(user, password) {
  bcrypt.compare(password, user.password).then(isEqual => {
    if (isEqual) {
      return user;
    }
    return Promise.reject(new Error('Invalid credentials.'));
  });
};

const verifyCallback = (username, password, done) =>
  Auth.findUserByEmail(username)
    .then(user => {
      if (user) {
        return checkPassword(user, password)
          .then(user => done(null, user))
          .catch(error => done(null, false, error.message));
      } else {
        return done(null, false, { message: 'incorrect username' });
      }
    })
    .catch(error => done(null, false, error.message));

passport.serializeUser((user, done) => done(null, user.uid));

passport.deserializeUser((id, done) =>
  Auth.findUserById(id)
    .then(user => done(null, user))
    .catch(error => done(error, {}))
);

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    verifyCallback
  )
);

const authSettings = {
  successRedirect: '/',
  failureRedirect: '/'
};

module.exports = {
  passport,
  authenticate: passport.authenticate('local', authSettings)
};
