var express = require('express')
var router = express.Router()
var Task = require('../models/task')

router.get('/eisenhower', (req, res) => {
  res.render('paradigms/eisenhower.pug', {
    user : req.user,
    title : 'Eisenhower Matrix'
  })
});

router.get('/kanban', (req, res) => {
  res.render('paradigms/kanban.pug', {
    user : req.user,
    title : 'Kanban'
  })
});

router.get('/pomodoro', (req, res) => {
  res.render('paradigms/pomodoro.pug', {
    user : req.user,
    title : 'Pomodoro'
  })
});


module.exports = router
