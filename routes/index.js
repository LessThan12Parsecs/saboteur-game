var express = require('express');
var body = require('body-parser');
var router = express.Router();

/* GET pages. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Saboteur' });
});

router.get('/signUp',function (req,res,next) {
    res.render('signUp', {title:'SignUp'});
});

router.get('/Login',function (req,res,next) {
    res.render('Login', {title:''});
});



module.exports = router;
