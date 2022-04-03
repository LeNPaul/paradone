const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('pomodoro', {
      title : 'Pomodoro'
     });
});

module.exports = router;
