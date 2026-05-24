const { orders, products, generateNextOrderId } = require('../config/db');

const createOrder = (req, res) => {
    const { email, address, city, paymentMethod, totalAmount, items } = req.body;

    // 1. Validar datos básicos obligatorios
    if (!email || !email.trim()) {
        return res.status(400).send("El email/contacto es obligatorio");
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).send("El carrito no puede estar vacío");
    }

    // 2. Primera pasada: Validar existencia de productos y disponibilidad de Stock
    for (const item of items) {
        if (!item.productId) {
            return res.status(400).send("Hay un producto en el carrito sin ID válido");
        }

        // Buscar producto por ID en nuestro array global de memoria
        const product = products.find(p => p.id === Number(item.productId));

        if (!product) {
            return res.status(404).send(`El producto con ID ${item.productId} no existe.`);
        }

        if (product.stock < item.quantity) {
            return res.status(400).send(`Stock insuficiente para: ${product.title}. Disponible: ${product.stock}`);
        }
    }

    // 3. Segunda pasada: Si todo está perfecto, restamos el stock real del inventario
    for (const item of items) {
        const product = products.find(p => p.id === Number(item.productId));
        if (product) {
            product.stock -= Number(item.quantity); // Resta el stock en memoria
        }
    }

    // 4. Asignar ID incremental automático a la orden y guardarla en la lista de órdenes
    const newOrder = {
        id: generateNextOrderId(),
        email,
        address: address || "",
        city: city || "",
        paymentMethod: paymentMethod || "",
        totalAmount: Number(totalAmount) || 0.0,
        items
    };

    orders.push(newOrder);

    // Retornamos la orden creada con estado Created
    return res.status(201).json(newOrder);
};

module.exports = {
    createOrder
};