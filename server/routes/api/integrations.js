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

// @route  POST api/integrations
// @desc   Save new user integration
// @access Private
router.post('/', auth, async (req, res) => {
  const integration = {
    user_id: req.user.id,
    source: req.body.source,
    is_active: true,
    destination: req.body.destination,
    source_query: req.body.query,
    destination_modifier: req.body.modifier
  }
  const insertedIntegration = await Integration.create(integration);
  console.log(insertedIntegration)
  integration._id = insertedIntegration._id
  res.status(200).send(integration);
});

module.exports = router;
