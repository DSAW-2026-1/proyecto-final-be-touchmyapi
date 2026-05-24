const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Mapeo de los POST del AuthController.java
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;