const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/checkout', orderController.createOrder);
router.get('/user/:email', orderController.getOrdersByUser);

module.exports = router;