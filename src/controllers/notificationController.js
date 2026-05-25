const { notifications } = require('../config/db');

// 1. Obtener todas las notificaciones de un estudiante (ordenadas de la más reciente a la más vieja)
const getUserNotifications = (req, res) => {
    const { email } = req.params;
    if (!email) return res.status(400).send("El email es requerido");

    const userNotifs = notifications
        .filter(n => n.userEmail.toLowerCase().trim() === email.toLowerCase().trim())
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    return res.status(200).json(userNotifs);
};

// 2. Obtener el conteo de notificaciones SIN REVISAR (para el globo rojo de la campana)
const getUnreadCount = (req, res) => {
    const { email } = req.params;
    if (!email) return res.status(400).send("El email es requerido");

    const count = notifications.filter(n => 
        n.userEmail.toLowerCase().trim() === email.toLowerCase().trim() && !n.read
    ).length;

    return res.status(200).json({ unreadCount: count });
};

// 3. Marcar una notificación específica como REVISADA
const markAsRead = (req, res) => {
    const { notificationId } = req.params;
    
    const notif = notifications.find(n => n.id === Number(notificationId));
    if (!notif) return res.status(404).send("Notificación no encontrada");

    notif.read = true;
    return res.status(200).send("Notificación revisada.");
};

// 4. Marcar TODAS las notificaciones de un usuario como REVISADAS (útil cuando entran a la página de alertas)
const markAllAsRead = (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).send("El email es requerido");

    notifications.forEach(n => {
        if (n.userEmail.toLowerCase().trim() === email.toLowerCase().trim()) {
            n.read = true;
        }
    });

    return res.status(200).send("Todas las notificaciones marcadas como revisadas.");
};

// 5. FUNCIÓN INTERNA GLOBAL (Se usará desde los otros controladores para disparar alertas)
const createNotification = (io, userEmail, text, type) => {
    const newNotif = {
        id: Date.now() + Math.floor(Math.random() * 1000), // Evitar colisiones de IDs rápidos
        userEmail: userEmail.toLowerCase().trim(),
        text,
        type, // 'BIENVENIDA', 'COMPRA', 'VENTA', 'CARRITO', 'PASSWORD', 'ENTREGA'
        read: false,
        date: new Date().toISOString()
    };

    notifications.push(newNotif);

    // Si el servidor de WebSockets está activo, emitimos en vivo a la sala privada del usuario
    if (io) {
        io.to(userEmail.toLowerCase().trim()).emit('notification_received', newNotif);
        console.log(`[SOCKET] Alerta enviada en vivo a: ${userEmail}`);
    }

    return newNotif;
};

module.exports = {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    createNotification //  La usaremos como trigger en la Fase 2
};