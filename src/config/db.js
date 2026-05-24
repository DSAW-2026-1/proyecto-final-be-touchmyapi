const users = new Map(); // El email será la llave única
const products = [];     // Array para manejar la lista de productos
const orders = [];       // Array para guardar los checkouts realizados

// 2. Generadores de IDs incrementales automáticos
let productIdCounter = 1;
let orderIdCounter = 1;

// 3. Inicialización de Datos por Defecto
function initData() {
  
    const admin = {
        id: "ADMIN-001",
        name: "Jusselth",
        lastName: "Chica",
        email: "jusselth@unisabana.edu.co",
        password: "admin123",
        career: "Ingeniería de Sistemas",
        role: "ADMIN"
    };
    users.set(admin.email.toLowerCase(), admin);

    // Inicializar el Producto de Prueba por Defecto
    const p1 = {
        id: productIdCounter++,
        title: "Cargador tipo C",
        price: 36000.0,
        stock: 5,
        category: "Electrónica",
        condition: "NEW",
        description: "Cargador de carga rápida para dispositivos Android.",
        imageUrl: "",
        ownerEmail: "prueba@unisabana.edu.co"
    };
    products.push(p1);

    console.log("Base de datos virtual en memoria inicializada con éxito.");
}

// Ejecutar la precarga al importar el archivo
initData();

// 4. métodos necesarios para que los controladores interactúen con la data
module.exports = {
    users,
    products,
    orders,
    // Helpers 
    generateNextProductId: () => productIdCounter++,
    generateNextOrderId: () => orderIdCounter++,
};