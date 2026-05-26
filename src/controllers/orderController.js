const { orders, products } = require('../config/db');
const { createNotification } = require('./notificationController');

const createOrder = (req, res) => {
    const { email, address, city, paymentMethod, totalAmount, items } = req.body;

    if (!email || !email.trim()) {
        return res.status(400).send("El email/contacto es obligatorio");
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).send("El carrito no puede estar vacío");
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validar existencias
    for (const item of items) {
        if (!item.productId) {
            return res.status(400).send("Hay un producto en el carrito sin ID válido");
        }
        const product = products.find(p => p.id === Number(item.productId));
        if (!product) {
            return res.status(404).send(`El producto con ID ${item.productId} no existe.`);
        }
        if (product.stock < item.quantity) {
            return res.status(400).send(`Stock insuficiente para: ${product.title}. Disponible: ${product.stock}`);
        }
    }

    // Descontar Stock
    for (const item of items) {
        const product = products.find(p => p.id === Number(item.productId));
        product.stock -= item.quantity;
    }

    const nextOrderId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;

    const newOrder = {
        id: nextOrderId,
        email: normalizedEmail,
        address,
        city,
        paymentMethod,
        totalAmount: Number(totalAmount),
        status: "PENDIENTE",
        items,
        date: new Date().toISOString()
    };

    orders.push(newOrder);

    // LÓGICA DE DETONACIÓN DE NOTIFICACIONES (COMPRA Y VENTAS)
    const io = req.app.get('io');

    // A. Notificación para el Comprador
    createNotification(
        io,
        normalizedEmail,
        `¡Tu compra se ha procesado con éxito! Número de Orden asignado: #${nextOrderId}. Revisa los detalles en tu perfil.`,
        'COMPRA'
    );

    // B. Notificación para los Vendedores
    const uniqueSellers = [...new Set(items.map(item => item.ownerEmail?.toLowerCase().trim()))];
    
    uniqueSellers.forEach(sellerEmail => {
        if (sellerEmail) {
            const itemsFromThisSeller = items.filter(item => item.ownerEmail?.toLowerCase().trim() === sellerEmail);
            const totalItemsCount = itemsFromThisSeller.reduce((acc, curr) => acc + curr.quantity, 0);

            createNotification(
                io,
                sellerEmail,
                `¡Felicidades! Has vendido ${totalItemsCount} artículo(s) en la Orden #${nextOrderId}. Revisa tu panel de ventas para coordinar la entrega en el campus.`,
                'VENTA'
            );
        }
    });

    return res.status(201).json(newOrder);
};

const getOrdersByUser = (req, res) => {
    const { email } = req.params;
    if (!email) return res.status(400).send("El email es obligatorio");

    const normalizedEmail = email.toLowerCase().trim();
    const userOrders = orders.filter(o => o.email === normalizedEmail);
    return res.status(200).json(userOrders);
};

const getSalesBySeller = (req, res) => {
    const { email } = req.params;
    if (!email) {
        return res.status(400).send("El email del vendedor es requerido");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const sellerSales = [];

    orders.forEach(order => {
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

const updateOrderStatus = (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body; 
    console.log("--- DEPURACIÓN DE REQUEST ---");
    console.log("Headers:", req.headers); // ¿Viene el Content-Type: application/json?
    console.log("Body crudo:", req.body); // ¿Esto llega como {} o como el objeto?
    // 1. Validación de Entrada (Protección contra el error 400)
    if (!status) {
        return res.status(400).json({ error: "El campo 'status' es obligatorio en el cuerpo de la petición." });
    }

    // 2. Buscar la orden
    const parsedId = Number(orderId);
    const order = orders.find(o => o.id === parsedId);
    
    if (!order) {
        return res.status(404).json({ error: "La orden no existe." });
    }

    // 3. Actualización de estado
    order.status = status;
    const io = req.app.get('io');

    // 4. Lógica de Notificaciones (Se mantiene igual, pero protegida)
    if (status === 'LISTO') {
        createNotification(io, order.email, `¡Buenas noticias! Tu pedido #${order.id} está LISTO.`, 'ESTADO');
    }

    if (status === 'QUIERO_MI_PRODUCTO') {
        // ... (Tu lógica de uniqueSellers)
    }

    if (status === 'ENTREGADO') {
        // ... (Tu lógica de notificación de entrega)
    }

    // Respuesta exitosa
    return res.status(200).json({ message: "Orden actualizada con éxito", order });
};

module.exports = {
    createOrder,
    getOrdersByUser,
    getSalesBySeller,
    updateOrderStatus
};