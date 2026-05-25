const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');


router.get('/seller/:email', orderController.getSalesByOwner);
router.patch('/:orderId/status', orderController.updateOrderStatus);

router.post('/checkout', orderController.createOrder);
router.get('/user/:email', orderController.getOrdersByUser);

module.exports = router;