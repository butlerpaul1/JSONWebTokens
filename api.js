const express = require('express');
var bodyParser = require('body-parser');
const models = require('./models');

const jwt = require('jsonwebtoken');

const auth = require('./auth');

const response = (status, message, data=undefined) => {
  return { status, message, data };
}


const router = express.Router();
router.all('/hmacauth/login', auth.guardEndpointHMAC);
var Sequelize = require('sequelize');
var sequelize = new Sequelize('postgres://postgres:1234@localhost:5432/postgres');

//users
router.get('/users', (req, res) =>  {

  sequelize.query("select * from users", { type: sequelize.QueryTypes.SELECT})
    .then(function(users){
      res.json(users);
    });
});

router.put('/products', verifyToken, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if(err) {
      res.sendStatus(401);
    } else {
      res.json({
        message: 'Access Granted',
        authData
      });
    }
  });
});

router.post('/testlogin', (req, res) =>  {
  const username = req.body.username;
  const password = req.body.password;
  const select = "SELECT id FROM users WHERE username = lower(username) AND password = crypt(password, password);";


  sequelize.query(select,{replacements: {username, password}}, { type: sequelize.QueryTypes.SELECT})
    .then(function(users){
      jwt.sign({users}, 'secretkey', (err, token , authData) => {
          exp: Math.floor(Date.now() / 1000) + (60 * 60);
        res.json({
          message:'token granted',
          exp: Math.floor(Date.now() / 1000) + (60 * 60),
          token
        });
      });
    });
});


router.post('/register', (req, res) =>  {
    const username = req.body.username;
    const password = req.body.password;
    const insert = "INSERT INTO users (username, password) VALUES \
                    (:username, crypt(:password, gen_salt('bf', 8)) );";

    sequelize.query(insert, {replacements: {username, password}}, { type: sequelize.QueryTypes.INSERT}).then(() =>{
          res.send(("message", "Successfully registered"));
        });
  });




  router.post('/register/hmac', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const access_key = auth.keyGen(160); // access key
  const secret_key = auth.keyGen(320); // secret_key
  const insert = "INSERT INTO users (username, password, access_key, secret_key) VALUES \
    (:username, crypt(:password, gen_salt('bf', 8)), :access_key , :secret_key);";

  sequelize.query(insert, { replacements: {username, password, access_key, secret_key } }, { type: sequelize.QueryTypes.INSERT}).then(() => {
    res.json({message: "Successfully registered", access_key: access_key, secret_key: secret_key} )
  });
});

router.get('/hmacauth/login', (req, res) => {
  res.send(response('Success', 'Authentication via HMAC successful'));
});
//Format of token. Authorization : Bearer <access_token>

//Verify token
function verifyToken(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers['authorization'];
  // Check if bearer is undefined
  if(typeof bearerHeader !== 'undefined') {
    // Split at the space
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const bearerToken = bearer[1];
    // Set the token
    req.token = bearerToken;

    // Next middleware
    next();
  } else {
    // Forbidden
    res.sendStatus(401);
}
}

module.exports = router;
