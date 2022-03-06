var express = require('express');
var router = express.Router();

// Blog post listing
router.get('/', (req, res) => {
  res.render('blog')
});

// Inidividual blog posts
router.get('/the-five-pillars-of-getting-things-done', (req, res) => {
  res.render('posts/the-five-pillars-of-getting-things-done')
})

module.exports = router;
