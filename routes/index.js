var express = require('express');
var router = express.Router();

const homeController = require('../controller/home');
const securityController= require('../controller/securityController')


/* GET home page. */
router.get('/api/home',homeController.getHome) ;
router.get('/api/security',securityController.getLogs);




module.exports = router;
