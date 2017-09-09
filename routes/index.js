var express = require('express');
var body = require('body-parser');
var router = express.Router();

/* GET pages. */
router.get('/', function(request, response, next) {
  if(request.session.user){
      response.redirect('/games/dashboard');

  }
  else{
      response.render('index',{ user:undefined});
  }
});

module.exports = router;
