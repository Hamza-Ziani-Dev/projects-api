const express = require('express');
const router = express.Router();
const {registerController, loginController } = require('../controllers/authController');

//Register :
router.post('/register', registerController);

//Login:
router.post('/login', loginController);


module.exports = router;