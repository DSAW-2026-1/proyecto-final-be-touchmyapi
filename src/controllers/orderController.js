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

    // Normalizar el email a minúsculas para evitar fallos de Case Sensitivity
    const normalizedEmail = email.toLowerCase().trim();

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

    // 🌟 NUEVO: Enriquecer los items con el Título y Precio real del producto antes de guardar
    const enrichedItems = items.map(item => {
        const product = products.find(p => p.id === Number(item.productId));
        return {
            productId: Number(item.productId),
            quantity: Number(item.quantity),
            title: product.title,       // 👈 Agregamos el título real
            price: Number(product.price) // 👈 Agregamos el precio real
        };
    });

    // 3. Segunda pasada: Si todo está perfecto, restamos el stock real del inventario
    for (const item of items) {
        const product = products.find(p => p.id === Number(item.productId));
        if (product) {
            product.stock -= Number(item.quantity); // Resta el stock en memoria
        }
    }

    // 4. Guardar la orden estructurada de manera impecable
    const newOrder = {
        id: generateNextOrderId(),
        email: normalizedEmail,
        address: address || "",
        city: city || "",
        paymentMethod: paymentMethod || "",
        totalAmount: Number(totalAmount) || 0.0,
        items: enrichedItems // 🌟 Guardamos los ítems con toda su información mapeada
    };

    orders.push(newOrder);

    // Retornamos la orden creada con estado Created
    return res.status(201).json(newOrder);
};

const getOrdersByUser = (req, res) => {
    const { email } = req.params;
    if (!email) {
        return res.status(400).send("El email es requerido");
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    // 🌟 CORREGIDO: Aseguramos el filtrado estricto en minúsculas en el array global db
    const userOrders = orders.filter(o => o.email && o.email.toLowerCase() === normalizedEmail);
    
    return res.json(userOrders);
};

module.exports = {
    createOrder,
    getOrdersByUser
};