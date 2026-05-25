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

    // ✨ CORRECCIÓN AQUÍ: Guardamos el ownerEmail del producto dentro de la orden
    const enrichedItems = items.map(item => {
        const product = products.find(p => p.id === Number(item.productId));
        return {
            productId: Number(item.productId),
            quantity: Number(item.quantity),
            title: product.title,       
            price: Number(product.price),
            ownerEmail: product.ownerEmail // 👈 ¡Bolas! Esto era lo que faltaba
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
        status: "PENDIENTE",
        items: enrichedItems
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
    
    
    const userOrders = orders.filter(o => o.email && o.email.toLowerCase() === normalizedEmail);
    
    return res.json(userOrders);
};

const getSalesByOwner = (req, res) => {
    const { email } = req.params;
    if (!email) {
        return res.status(400).send("El email del vendedor es requerido");
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Filtramos las órdenes globales donde al menos un producto pertenezca al vendedor
    const sellerSales = [];

    orders.forEach(order => {
        // Filtrar solo los ítems que le pertenecen a este vendedor
       
        const myItems = order.items.filter(item => item.ownerEmail?.toLowerCase().trim() === normalizedEmail);
        
        if (myItems.length > 0) {
            sellerSales.push({
                id: order.id,
                buyerEmail: order.email,
                address: order.address,
                city: order.city,
                paymentMethod: order.paymentMethod,
                totalAmount: order.totalAmount, 
                status: order.status || "PENDIENTE", 
                items: myItems
            });
        }
    });

    return res.status(200).json(sellerSales);
};

// 2. Cambiar el estado de una orden a "ENTREGADO"
const updateOrderStatus = (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body; 

    const order = orders.find(o => o.id === Number(orderId));
    if (!order) {
        return res.status(404).send("La orden no existe");
    }

    order.status = status; 
    return res.status(200).json(order);
};

module.exports = {
    createOrder,
    getOrdersByUser,
    getSalesByOwner, 
    updateOrderStatus
};