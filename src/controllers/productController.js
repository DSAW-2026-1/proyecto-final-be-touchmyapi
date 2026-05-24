const { products, generateNextProductId } = require('../config/db');

// 1. Obtener todos los productos 
const getAllProducts = (req, res) => {
    return res.json(products);
};

// 2. Obtener productos de un dueño específico
const getProductsByOwner = (req, res) => {
    const { email } = req.params;
    const normalizedEmail = email.toLowerCase().trim();
    
    const ownerProducts = products.filter(p => p.ownerEmail && p.ownerEmail.toLowerCase() === normalizedEmail);
    return res.json(ownerProducts);
};

// 3. Crear un nuevo producto
const createProduct = (req, res) => {
    const { title, description, price, stock, category, condition, imageUrl, ownerEmail } = req.body;

    // Validación básica
    if (!title || !description || !price || !stock || !category || !condition || !ownerEmail) {
        return res.status(400).send("Faltan datos obligatorios.");
    }

    const newProduct = {
        id: generateNextProductId(), // Usa el contador incremental automático
        title,
        description: description || "",
        price: Number(price),
        stock: stock !== undefined ? Number(stock) : 1, // por si acaso
        category: category,
        condition: condition,
        imageUrl: imageUrl || "",
        ownerEmail: ownerEmail.toLowerCase().trim()
    };

    products.push(newProduct);
    
    const user = users.get(normalizedEmail);

    if (user) {
        if (user.role === 'USER') {
            user.role = 'SELLER';
            users.set(normalizedEmail, user); 
            console.log(`🚀 Usuario ${normalizedEmail} promovido a SELLER.`);
        }
    }

    return res.status(201).json(newProduct);
};

// 4. Actualizar un producto
const updateProduct = (req, res) => {
    const { id } = req.params;
    const { title, price, stock, category, description, imageUrl, condition } = req.body;

    // Buscar el producto por ID 
    const product = products.find(p => p.id === Number(id));

    if (!product) {
        return res.status(404).send("Producto no encontrado");
    }

    // Mapeamos los sets 
    product.title = title !== undefined ? title : product.title;
    product.price = price !== undefined ? Number(price) : product.price;
    product.stock = stock !== undefined ? Number(stock) : product.stock;
    product.category = category !== undefined ? category : product.category;
    product.description = description !== undefined ? description : product.description;
    product.imageUrl = imageUrl !== undefined ? imageUrl : product.imageUrl;
    product.condition = condition !== undefined ? condition : product.condition;

    return res.json(product);
};

// 5. Eliminar un producto
const deleteProduct = (req, res) => {
    const { id } = req.params;
    
    // Buscamos la posición del producto en el array
    const index = products.findIndex(p => p.id === Number(id));

    if (index === -1) {
        return res.status(404).send("Producto no encontrado");
    }

    const ownerEmail = products[index].ownerEmail?.toLowerCase().trim();

    // Eliminamos del array en memoria
    products.splice(index, 1);

    if (ownerEmail) {
        const hasMoreProducts = products.some(p => p.ownerEmail && p.ownerEmail.toLowerCase() === ownerEmail);
        
        // Si ya no publica nada y figuraba como SELLER, retorna a su estado base de USER
        const user = users.get(ownerEmail);
        if (user && user.role === 'SELLER' && !hasMoreProducts) {
            user.role = 'USER';
            users.set(ownerEmail, user);
        }
    }

    return res.status(200).send("Producto eliminado con éxito");
};

module.exports = {
    getAllProducts,
    getProductsByOwner,
    createProduct,
    updateProduct,
    deleteProduct
};