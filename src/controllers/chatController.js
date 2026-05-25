const { chats } = require('../config/db');

// Obtener todos los chats de un usuario
const getUserChats = async (req, res) => {
    try {
        const { email } = req.params;
        const decodedEmail = decodeURIComponent(email).trim().toLowerCase();
        
        // Filtramos chats donde el usuario sea comprador o vendedor
        const userChats = chats.filter(chat => {
            const buyer = (chat.buyerEmail || "").toLowerCase().trim();
            const seller = (chat.sellerEmail || "").toLowerCase().trim();
            return buyer === decodedEmail || seller === decodedEmail;
        });

        return res.status(200).json(userChats);
    } catch (error) {
        console.error("Error en getUserChats:", error);
        return res.status(500).json({ message: "Error interno" });
    }
};

// Obtener los mensajes de una sala específica (NECESARIO PARA EL POLLING DEL FRONTEND)
const getRoomMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const chat = chats.find(c => c.roomId === roomId || c.id === roomId);
        
        if (!chat) {
            return res.status(404).json({ message: "Chat no encontrado" });
        }
        return res.status(200).json(chat);
    } catch (error) {
        console.error("Error en getRoomMessages:", error);
        return res.status(500).json({ message: "Error interno" });
    }
};

// Guardar nuevo mensaje
const saveMessage = async (req, res) => {
    try {
        const { roomId, productId, productTitle, productImage, buyerEmail, sellerEmail, senderEmail, text } = req.body;

        const newMessagePayload = {
            id: Date.now().toString(),
            senderEmail,
            text,
            timestamp: new Date().toISOString()
        };

        const existingChat = chats.find(c => c.roomId === roomId || c.id === roomId);

        if (existingChat) {
            if (!existingChat.messages) existingChat.messages = [];
            existingChat.messages.push(newMessagePayload);
            existingChat.updatedAt = new Date().toISOString();
        } else {
            // Crear nueva sala si no existe
            const newChatRoom = {
                id: roomId,
                roomId: roomId,
                productId,
                productTitle,
                productImage,
                buyerEmail,
                sellerEmail,
                messages: [newMessagePayload],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            chats.push(newChatRoom);
        }

        return res.status(200).json({ success: true, message: "Mensaje guardado" });
    } catch (error) {
        console.error("Error en saveMessage:", error);
        return res.status(500).json({ message: "Error al guardar mensaje" });
    }
};

module.exports = {
    getUserChats,
    getRoomMessages,
    saveMessage
};