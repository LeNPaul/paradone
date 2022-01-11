const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');

// User model
const User = require('../../models/User');
// Label model
const Label = require('../../models/Label');

// @route  POST api/users
// @desc   Register new user
// @access Public
router.post('/', (req, res) => {

  const { username, email, password } = req.body;

  // Simple validation
  if(!username || !email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  // Check for existing user
  User.findOne({ email })
    .then(user => {
      if(user) return res.status(400).json({ msg: 'User already exists' });

      const newUser = new User({
        username,
        email,
        password
      });

      // Create salt & hash
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if(err) throw err;
          newUser.password = hash;
          newUser.save()
          .then(user => {

            jwt.sign(
              { id: user.id },
              config.get('jwtSecret'),
              { expiresIn: config.get('expiresIn') },
              (err, token) => {
                if(err) throw err;
                Label.create({
                  user_id:  user.id,
                  label_name: "To Do"
                });
                Label.create({
                  user_id:  user.id,
                  label_name: "Doing"
                });
                Label.create({
                  user_id:  user.id,
                  label_name: "Done"
                });
                res.json({
                  token,
                  user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                  }
                });
              }
            )

          });
        });
      });

    });

});

module.exports = router;
