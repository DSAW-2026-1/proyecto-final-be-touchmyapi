const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

router.delete('/:reviewId', reviewController.deleteReview);
router.post('/', reviewController.createReview);
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/seller-stats/:email', reviewController.getSellerStats);

module.exports = router;