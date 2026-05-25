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
const deleteReview = (req, res) => {
    const { reviewId } = req.params;
    
    // 1. Buscamos el índice exacto de la reseña usando su ID
    const reviewIndex = reviews.findIndex(r => r.id === Number(reviewId));

    // 2. Si no lo encuentra, retornamos error 404 de una
    if (reviewIndex === -1) {
        return res.status(404).send("La reseña no existe o ya fue eliminada.");
    }

    // 3. Modificamos el array original eliminando ese elemento específico con .splice()
    reviews.splice(reviewIndex, 1);

    return res.status(200).send("Reseña eliminada con éxito por el administrador.");
};

module.exports = { createReview, getProductReviews, getSellerStats, deleteReview };