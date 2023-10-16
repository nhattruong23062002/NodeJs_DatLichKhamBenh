const JwtStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const BasicStrategy = require('passport-http').BasicStrategy;
const bcrypt = require('bcrypt');


const jwtSettings = require('../constants/jwtSetting');
var db = require('../models/index');
var isValidPassword = require('../services/CRUDService');



const passportConfig = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken('Authorization'),
    secretOrKey: jwtSettings.SECRET,
  },
  async (payload, done) => {
    try {
      const user = await db.User.findOne({ where: { id: payload.id } });

      if (!user) return done(null, false);

      return done(null, user);
    } catch (error) {
      done(error, false);
    }
  },
);


const passportConfigLocal = new LocalStrategy(
  {
    usernameField: 'email',
  },
  async (email, password, done) => {
    try {
      const user = await db.User.findOne({ where: { email: email } });
      console.log('««««« user »»»»»', user);
      if (!user) return done(null, false);

      const isCorrectPass = await bcrypt.compare(password, user.password);
      console.log('««««« isCorrectPass »»»»»', isCorrectPass);

      if (!isCorrectPass) return done(null, false);

      return done(null, user);
    } catch (error) {
      done(error, false);
    }
  },
);
/* const passportConfigBasic = new BasicStrategy(async function (username, password, done) {
  try {
    const user = await Employees.findOne({ email: username });
  
    if (!user) return done(null, false);
  
    const isCorrectPass = await user.isValidPass(password);
  
    if (!isCorrectPass) return done(null, false);
  
    return done(null, user);
  } catch (error) {
    done(error, false);
  }
}); */

module.exports = {
  passportConfig,
  passportConfigLocal,
 /*  passportConfigBasic */
};