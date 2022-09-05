const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth')

// Integration model
const Integration = require('../../models/Integration');

// @route  GET api/integrations
// @desc   Get user integrations
// @access Private
router.get('/', auth, async (req, res) => {
  res.send(await Integration.find({user_id: req.user.id}));
});

module.exports = router;
