const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Mapeo
router.get('/', productController.getAllProducts);
router.get('/owner/:email', productController.getProductsByOwner);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;