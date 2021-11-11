const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/', verifyToken, (req, res) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if(err) {
      res.sendStatus(403);
    } else {
      res.json({
        message: 'Post created',
        authData: authData
      })
    }
  })
})

router.post('/login', (req, res) => {
  // Mock user
  const user = {
    id: 1,
    username: 'paul',
    email: 'test@email.com'
  }
  jwt.sign({user}, 'secretkey', (err, token) => {
    res.json({
      token: token
    });
  });
});

// Verify Token
function verifyToken(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers['authorization'];
  if(typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
  }
}

module.exports = router;
