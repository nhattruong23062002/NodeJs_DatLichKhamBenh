var express = require('express');
var router = express.Router();
var db = require('../models/index');

/* GET home page. */
router.get('/',async function (req, res, next) {
  try {
    let data = await db.User.findAll();
    res.render('index', { title: 'Express' });
  } catch (e) {
    console.log('««««« e »»»»»', e);
  }
});

module.exports = router;
