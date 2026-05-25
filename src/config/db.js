const bcrypt = require('bcrypt');

const users = new Map(); // El email será la llave única
const products = [];     // Array para manejar la lista de productos
const orders = [];       // Array para guardar los checkouts realizados
const reviews = [];      // Lista de reseñas
const notifications = [];// Lista de notificaciones
const chats = [];        // Lista de chats

let productIdCounter = 1;
let orderIdCounter = 1;

async function initData() {
    try {
        const hashedPassword = await bcrypt.hash("admin123", 10);

        const admin = {
            id: "ADMIN-001",
            name: "Jusselth",
            lastName: "Chica",
            email: "jusselth@unisabana.edu.co",
            password: hashedPassword,
            career: "Ingeniería de Sistemas",
            role: "ADMIN"
        };
        
        users.set(admin.email.toLowerCase(), admin);
        console.log("👑 Usuario Administrador inicializado.");

        // ... (Tu lógica de inicialización de productos se mantiene igual aquí)
        // [He omitido el código de productos para brevedad, pero mantenlo igual en tu archivo]

        console.log(`📦 Catálogo de productos inicializado. Total productos: ${products.length}`);

    } catch (error) {
        console.error("❌ Error inicializando los datos por defecto:", error);
    }
}

initData();

module.exports = {
    users,
    products,
    orders,
    reviews,
    notifications,
    chats,
    // Helpers 
    generateNextProductId: () => productIdCounter++,
    generateNextOrderId: () => orderIdCounter++,
    initData
};