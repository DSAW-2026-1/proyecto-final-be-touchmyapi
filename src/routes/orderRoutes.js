const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Asegúrate de que las rutas llamen exactamente a los mismos nombres exportados:
router.post('/', orderController.createOrder);
router.get('/user/:email', orderController.getOrdersByUser);
router.get('/seller/:email', orderController.getSalesBySeller);
router.patch('/:orderId/status', orderController.updateOrderStatus); 

module.exports = router;