
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.get('/user/:email', chatController.getUserChats);

module.exports = router;