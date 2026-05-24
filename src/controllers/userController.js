const { users, products } = require('../config/db');

// 1. Obtener todos los usuarios del sistema
const getAllUsers = (req, res) => {
    // Convertimos el Map de usuarios a un Array
    const userList = Array.from(users.values());
    return res.json(userList);
};

// 2. Eliminar un usuario y sus publicaciones asociadas
const deleteUser = (req, res) => {
    const { email } = req.params;
    const normalizedEmail = email.toLowerCase().trim();

    // Protección: Nadie puede eliminar al administrador principal
    if (normalizedEmail === 'jusselth@unisabana.edu.co') {
        return res.status(403).send("¡Error! No puedes eliminar al administrador principal del sistema.");
    }

    // Si el usuario no existe en el Map
    if (!users.has(normalizedEmail)) {
        return res.status(404).send("Usuario no encontrado");
    }

    // Lógica en cascada: Eliminar productos cuyo dueño sea este usuario (dataStore.deleteProductsByOwner)
    // Modificamos el array de productos en memoria filtrando solo los que NO son de este dueño
    for (let i = products.length - 1; i >= 0; i--) {
        if (products[i].ownerEmail && products[i].ownerEmail.toLowerCase() === normalizedEmail) {
            products.splice(i, 1);
        }
    }

    // Eliminar el usuario del Map
    users.delete(normalizedEmail);

    return res.status(200).send("Usuario y sus publicaciones eliminados con éxito");
};

// 3. Cambiar rol de USER a ADMIN y viceversa
const toggleUserRole = (req, res) => {
    const { email } = req.params;
    const normalizedEmail = email.toLowerCase().trim();

    // Protección: Nadie puede degradar al administrador principal
    if (normalizedEmail === 'jusselth@unisabana.edu.co') {
        return res.status(403).send("El administrador principal no puede ser degradado.");
    }

    const user = users.get(normalizedEmail);

    if (!user) {
        return res.status(404).send("Usuario no encontrado");
    }

    // Lógica de Toggle
    if (user.role === 'ADMIN') {
        user.role = 'USER';
    } else {
        user.role = 'ADMIN';
    }

    // Guardar el estado actualizado
    users.set(normalizedEmail, user);

    return res.json(user);
};

module.exports = {
    getAllUsers,
    deleteUser,
    toggleUserRole
};