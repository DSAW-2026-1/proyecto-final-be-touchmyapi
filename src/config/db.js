const bcrypt = require('bcrypt');
const users = new Map(); // El email será la llave única
const products = [];     // Array para manejar la lista de productos
const orders = [];       // Array para guardar los checkouts realizados
const reviews = [];      // Lista de reseñas
const notifications = [];// Lista de notificaciones
const chats = [];        // Lista de chats

let productIdCounter = 1;
let orderIdCounter = 1;

// 3. Inicialización de Datos por Defecto
async function initData() {
    try {
        // Encriptamos "admin123" usando exactamente el mismo método del authController
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

        // Inicializar Productos de Prueba por Defecto
        const p1 = {
            id: productIdCounter++,
            title: "Cargador tipo C",
            price: 36000,
            stock: 5,
            category: "ELECTRONICS",
            condition: "NEW",
            description: "Cargador de carga rápida para dispositivos Android.",
            imageUrl: "https://media.falabella.com/falabellaCO/142354801_01/w=1500,h=1500,fit=cove",
            ownerEmail: "prueba@unisabana.edu.co"
        };
        products.push(p1);

        const p2 = {
            id: productIdCounter++,
            title: "Libro 100 años de soledad",
            price: 150000,
            stock: 1,
            category: "BOOKS",
            condition: "NEW",
            description: "Libro famoso escrito por Gabriel García Márquez",
            imageUrl: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjE3CPA_tuzhpPyTsBbLmmcHgVNmd62pMdRurl9jJDZcbrvbgdvqe3on1Lz0RO5zpLbguKh175MFA5H3vg-hicK3oxaftaYECyuwfF4-TT7J-BOueoxGhAf9DvzrFe0aIOS88nIcR6xEeRo7qzo4DMNQXIuEKlemMu3QDe1aoytIN9Zno3wNYJlJHaSCOU/s606/078-Cien%20a%C3%B1os%20de%20soledad-Gabriel%20Garc%C3%ADa%20M%C3%A1rquez.jpg",
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
            imageUrl: "https://http2.mlstatic.com/D_NQ_NP_875737-MCO95801924860_102025-O.webp",
            ownerEmail: "prueba@unisabana.edu.co"
        };
        products.push(p3);
        // ... (Tu lógica de inicialización de productos se mantiene igual aquí)
        // [He omitido el código de productos para brevedad, pero mantenlo igual en tu archivo]

    } catch (error) {
        console.error("Error al inicializar los datos en db:", error);
        console.error("❌ Error inicializando los datos por defecto:", error);
    }
}

// Ejecutar la precarga al importar el archivo
initData();

// 4. métodos necesarios para que los controladores interactúen con la data
module.exports = {
    reviews,
    users,
    products,
    orders,
    // Helpers 
    generateNextProductId: () => productIdCounter++,
    generateNextOrderId: () => orderIdCounter++,
    reviews,
    notifications,
    chats,
    // Helpers 
    generateNextProductId: () => productIdCounter++,
    generateNextOrderId: () => orderIdCounter++,
    initData
};