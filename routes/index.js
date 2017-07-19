var express = require('express');
var body = require('body-parser');
var router = express.Router();

/* GET pages. */
router.get('/', function(request, response, next) {
  //var user = request.session.user;
  if(request.session.user === undefined){
      response.render('index',{ user:undefined});
  }
  else{
      response.redirect('/game/dashboard');
  }
});

module.exports = router;
