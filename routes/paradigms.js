var express = require('express')
var router = express.Router()
var Task = require('../models/task')

router.get('/eisenhower', (req, res) => {
  res.render('paradigms/eisenhower.pug', {
    user : req.user,
    title : 'Eisenhower Matrix'
  })
});

module.exports = router
