var express = require('express');
var router = express.Router();

// Blog post listing
router.get('/', (req, res) => {
  res.render('blog')
});

// Inidividual blog posts
router.get('/the-five-pillars-of-getting-things-done', (req, res) => {
  res.render('posts/the-five-pillars-of-getting-things-done', {title: 'The Five Pillars of Getting Things Done'})
})

router.get('/the-pomodoro-technique-the-life-changing-time-management-system-francesco-cirillo-book-summary', (req, res) => {
  res.render('posts/the-pomodoro-technique-the-life-changing-time-management-system-francesco-cirillo-book-summary', {title: 'The Pomodoro Technique: The Life-Changing Time-Management System by Francesco Cirillo Book Summary'})
})

module.exports = router;
