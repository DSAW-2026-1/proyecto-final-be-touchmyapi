// Controlador para manejar las peticiones HTTP del chat
const getUserChats = async (req, res) => {
    try {
        const { email } = req.params;
        console.log(`[CHATS] Buscando historial para: ${email}`);
        
        // Estructura vacía inicial para pruebas de base de datos en memoria
        const userChats = []; 
        
        return res.status(200).json(userChats);
    } catch (error) {
        console.error("Error en getUserChats:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};

module.exports = {
    getUserChats
};