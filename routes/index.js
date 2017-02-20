var express = require('express');
var body = require('body-parser');
var router = express.Router();

/* GET pages. */
router.get('/', function(request, response, next) {
  var user = request.session.user;
  response.render('index',{ user:user});
});

module.exports = router;
