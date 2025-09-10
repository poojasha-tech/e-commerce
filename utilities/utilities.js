const crypto = require('crypto');
const jwt = require('jsonwebtoken');   
const secret="bigsecret"; // Define your secret key for JWT signing



function hashPassword(password) {
  const hash = crypto.createHmac('md5', secret).update(password).digest('hex');
  return hash
}

function jwtToken(user) {
  var token = jwt.sign({

    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
    data: user
  }, secret);
  return token;
}

module.exports = { hashPassword, jwtToken };