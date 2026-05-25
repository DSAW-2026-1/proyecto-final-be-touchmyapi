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

    // B. Notificación para los Vendedores (Evitando duplicar si un vendedor tiene varios artículos en el mismo carrito)
    const uniqueSellers = [...new Set(items.map(item => item.ownerEmail?.toLowerCase().trim()))];
    
    uniqueSellers.forEach(sellerEmail => {
        if (sellerEmail) {
            // Obtenemos los ítems que son de este vendedor en esta orden específica
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

    const order = orders.find(o => o.id === Number(orderId));
    if (!order) {
        return res.status(404).send("La orden no existe");
    }

    // Normalizar el estado recibido a mayúsculas para evitar errores de tipeo
    const normalizedStatus = status ? status.toUpperCase().trim() : '';

    // Validar que el estado enviado esté dentro del flujo permitido
    const validStatuses = ['PENDING', 'READY_FOR_DELIVERY', 'DELIVERED', 'ENTREGADO'];
    if (!validStatuses.includes(normalizedStatus)) {
        return res.status(400).send("El estado proporcionado no es válido.");
    }

    // Asignar el nuevo estado a la orden en memoria/DB
    order.status = normalizedStatus;

    const io = req.app.get('io');

    // CASO INTERMEDIO: El vendedor marca el producto como listo para recoger en el campus
    if (normalizedStatus === 'READY_FOR_DELIVERY') {
        createNotification(
            io,
            order.email, // Email del comprador guardado en la orden
            `¡Buenas noticias! Tu pedido de la Orden #${order.id} está listo para entrega. Ve a tu perfil para coordinar el recibo.`,
            'ENTREGA'
        );
    }

    // CASO FINAL: El producto cambia a "DELIVERED" o "ENTREGADO" (Handshake completado)
    if (normalizedStatus === 'DELIVERED' || normalizedStatus === 'ENTREGADO') {
        // Alerta al Comprador
        createNotification(
            io,
            order.email, 
            `Tu pedido de la Orden #${order.id} ha sido marcado como ENTREGADO. ¡No olvides dejar tu reseña sobre el producto!`,
            'ENTREGA'
        );

        // Alerta a los Vendedores vinculados a esta orden
        const uniqueSellers = [...new Set(order.items.map(item => item.ownerEmail?.toLowerCase().trim()))];
        uniqueSellers.forEach(sellerEmail => {
            if (sellerEmail) {
                createNotification(
                    io,
                    sellerEmail,
                    `Confirmado: Se completó la entrega de los productos relacionados a la Orden #${order.id}.`,
                    'ENTREGA'
                );
            }
        });
    }

    return res.status(200).json(order);
};

module.exports = {
    createOrder,
    getOrdersByUser,
    getSalesBySeller,
    updateOrderStatus
};