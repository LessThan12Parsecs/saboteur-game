var express = require('express');
var body = require('body-parser');
var router = express.Router();

/* GET pages. */
router.get('/dashboard', function(request, response, next) {
  var user = request.session.user;
  if(user === undefined){
      response.redirect('/users/Login',{title:'Please Login',user:undefined});
  }
  else{
      response.render('loggedUser')

  }
});

module.exports = router;
