var express = require('express');
var router = express.Router();
const passport = require("passport");

const Web3Strategy = require("passport-dapp-web3");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const users = [];

const onAuth = (address, done, req, params) => {
  req.res.send({
    address: req.body.address,
    client_sig: req.body.signed,
    server_sig: params.signed
  });
};

let id = 0;
passport.use(new Web3Strategy({
      addressField: 'address',
      messageField: 'msg',
      signedField: 'signed',
      session: false
    },
    function (address, message, signed, done) {
      let ethUser = users.find(e => e.address === address);
      if (ethUser) {
        console.log("Return existing user")
        return done(null, ethUser);
      } else {
        console.log("Created New User")
        let newUser = {
          id: id++,
          address,
          message,
          signed,
        };
        users.push(newUser)
        return done(null, newUser);
      }
    }
));

let authenticate = (req, res, next) => {
  passport.authenticate('web3', {}, (info, user, error) => {
    console.log({info, user, error})
    if (error) return next(error)
    if (user) {
      const token = jwt.sign(user, 'your_jwt_secret')
      return res.json({user, token})
    } else {
      return res.status(422).json(info)
    }
  })(req, res, next);
}
console.log({authenticate})

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', authenticate);

router.get('/profile', passport.authenticate("jwt", {}, () => {
}));


module.exports = router;
