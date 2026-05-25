const { reviews, orders, users } = require('../config/db');

const createReview = (req, res) => {
    const { productId, rating, comment, buyerEmail, sellerEmail } = req.body;

    // Guardamos la reseña
    const newReview = {
        id: Date.now(),
        productId: Number(productId),
        rating: Number(rating),
        comment,
        buyerEmail,
        sellerEmail,
        date: new Date().toISOString()
    };

    reviews.push(newReview);
    res.status(201).json(newReview);
};

const getProductReviews = (req, res) => {
    const { productId } = req.params;
    const productReviews = reviews.filter(r => r.productId === Number(productId));
    
    // Lógica de promedio (Solo si hay más de 10)
    const count = productReviews.length;
    let average = 0;
    if (count > 0) {
        average = productReviews.reduce((acc, curr) => acc + curr.rating, 0) / count;
    }

    res.json({
        reviews: productReviews,
        count,
        average: count >= 10 ? average.toFixed(1) : null // Si es < 10, mandamos null
    });
};

// Nueva función para traer info del vendedor
const getSellerStats = (req, res) => {
    const { email } = req.params;
    
    // Contamos cuántas órdenes del vendedor están como 'ENTREGADO'
    const totalSales = orders.filter(order => 
        order.status === 'ENTREGADO' && 
        order.items.some(item => item.ownerEmail === email)
    ).length;

    // Buscamos el nombre del vendedor en el Map de usuarios
    const seller = users.get(email.toLowerCase());

    res.json({
        fullName: seller ? `${seller.name} ${seller.lastName}` : "Usuario Sabana",
        totalSales
    });
};

module.exports = { createReview, getProductReviews, getSellerStats };