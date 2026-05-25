const bcrypt = require('bcrypt');

const users = new Map(); // El email será la llave única
const products = [];     // Array para manejar la lista de productos
const orders = [];       // Array para guardar los checkouts realizados
const reviews = [];

// === PERSISTENCIA CENTRALIZADA UNIFICADA PARA CHATS ===
const chats = []; 

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
        console.log("👑 Usuario Administrador inicializado y encriptado con éxito.");

        const p1 = {
            id: productIdCounter++,
            title: "Cargador tipo C",
            price: 36000,
            stock: 5,
            category: "ELECTRONICS",
            condition: "NEW",
            description: "Cargador de carga rápida para dispositivos de última generación.",
            imageUrl: "https://via.placeholder.com/150",
            ownerEmail: "prueba@unisabana.edu.co"
        };
        products.push(p1);

        const p2 = {
            id: productIdCounter++,
            title: "Cien años de soledad",
            price: 45000,
            stock: 2,
            category: "BOOKS",
            condition: "NEW",
            description: "Libro famoso escrito por Gabriel García Márquez",
            imageUrl: "https://via.placeholder.com/150",
            ownerEmail: "prueba@unisabana.edu.co"
        };
        products.push(p2);

        const p3 = {
            id: productIdCounter++,
            title: "Gomitas Trululú",
            price: 12000,
            stock: 3,
            category: "FOOD",
            condition: "NEW",
            description: "Deliciosas gomitas para comer mientras comienza la clase.",
            imageUrl: "https://via.placeholder.com/150",
            ownerEmail: "vendedor_prueba@unisabana.edu.co"
        };
        products.push(p3);

        console.log(`📦 Catálogo de productos inicializado. Total productos: ${products.length}`);

    } catch (error) {
        console.error("❌ Error inicializando los datos por defecto en db.js:", error);
    }
}

initData();

module.exports = {
    users,
    products,
    orders,
    reviews,
    chats, // Exportación limpia de la referencia global compartida
    initData
};