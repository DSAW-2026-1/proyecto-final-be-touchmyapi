const { products, users } = require('../config/db'); 
// Importar creador de notificaciones
const { createNotification } = require('./notificationController');

const getAllProducts = (req, res) => {
    return res.json(products);
};

const getProductsByOwner = (req, res) => {
    const { email } = req.params;
    const normalizedEmail = email.toLowerCase().trim();
    
    const ownerProducts = products.filter(p => p.ownerEmail && p.ownerEmail.toLowerCase() === normalizedEmail);
    return res.json(ownerProducts);
};

const createProduct = (req, res) => {
    const { title, description, price, stock, category, condition, imageUrl, ownerEmail } = req.body;

    if (!title || !description || !price || !stock || !category || !condition || !ownerEmail) {
        return res.status(400).send("Faltan datos obligatorios.");
    }

    const normalizedEmail = ownerEmail.toLowerCase().trim();
    const nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

    const newProduct = {
        id: nextId, 
        title,
        description: description || "",
        price: Number(price),
        stock: Number(stock),
        category,
        condition,
        imageUrl: imageUrl || "",
        ownerEmail: normalizedEmail
    };

    products.push(newProduct);

    const user = users.get(normalizedEmail);
    if (user && user.role === 'USER') {
        user.role = 'SELLER';
        users.set(normalizedEmail, user);
        console.log(`Usuario ${normalizedEmail} subió de rango a SELLER.`);
    }

    // Notificación de producto publicado con éxito
    const io = req.app.get('io');
    createNotification(
        io, 
        normalizedEmail, 
        `Tu producto "${title}" se ha publicado con éxito. ¡Ya está visible para todo el campus!`, 
        'PRODUCTO_PUBLICADO'
    );

    return res.status(201).json(newProduct);
};

const updateProduct = (req, res) => {
    const { id } = req.params;
    const { title, price, stock, category, description, imageUrl, condition } = req.body;

    const product = products.find(p => p.id === Number(id));

    if (!product) {
        return res.status(404).send("Producto no encontrado");
    }

    product.title = title !== undefined ? title : product.title;
    product.price = price !== undefined ? Number(price) : product.price;
    product.stock = stock !== undefined ? Number(stock) : product.stock;
    product.category = category !== undefined ? category : product.category;
    product.description = description !== undefined ? description : product.description;
    product.imageUrl = imageUrl !== undefined ? imageUrl : product.imageUrl;
    product.condition = condition !== undefined ? condition : product.condition;

    return res.json(product);
};

const deleteProduct = (req, res) => {
    const { id } = req.params;
    const index = products.findIndex(p => p.id === Number(id));

    if (index === -1) {
        return res.status(404).send("Producto no encontrado");
    }

    const ownerEmail = products[index].ownerEmail?.toLowerCase().trim();
    products.splice(index, 1);

    if (ownerEmail) {
        const hasMoreProducts = products.some(p => p.ownerEmail && p.ownerEmail.toLowerCase() === ownerEmail);
        const user = users.get(ownerEmail);
        if (user && user.role === 'SELLER' && !hasMoreProducts) {
            user.role = 'USER';
            users.set(ownerEmail, user);
            console.log(`Usuario ${ownerEmail} volvió a ser USER (sin publicaciones activas).`);
        }
    }

    return res.status(200).send("Producto eliminado correctamente.");
};

module.exports = {
    getAllProducts,
    getProductsByOwner,
    createProduct,
    updateProduct,
    deleteProduct
};