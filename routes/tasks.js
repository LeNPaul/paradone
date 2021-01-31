var express = require('express');
var router = express.Router();

// https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/* GET page for starting session. */
router.get('/hello', function(req, res) {
  var guid = uuidv4();
  res.json({guid: guid});
});

module.exports = router;
