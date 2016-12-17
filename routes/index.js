var express = require('express');
var router = express.Router();

/* GET pages. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Saboteur' });
});

router.get('/signUp',function (req,res,next) {
    res.render('signUp', {title:'SignUp'});
});

router.get('/Login',function (req,res,next) {
    res.render('Login', {title:'Login'});
});


module.exports = router;
