const CryptoJS = require('crypto-js');

let secret = 'keyboardcat123'

// Encrypt value in body of request
// TODO: handle case with nested objects
function encrypt(req, res, next) {
  for(const prop in req.body) {
    if(req.body[`${prop}`]) {
      req.body[`${prop}`] = CryptoJS.AES.encrypt(req.body[`${prop}`], secret).toString();
    }
  }
  next();
}

module.exports = encrypt;
