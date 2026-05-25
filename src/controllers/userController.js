const { users, products } = require('../config/db');
const bcrypt = require('bcrypt');

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
// 4. Restablecer contraseña de un usuario a la clave por defecto
const resetUserPassword = async (req, res) => { // <-- Se le agrega async aquí
    try {
        const { email } = req.params;
        const normalizedEmail = email.toLowerCase().trim();

        if (normalizedEmail === 'jusselth@unisabana.edu.co') {
            return res.status(403).send("¡Error! La contraseña del administrador principal está protegida y no puede ser restablecida.");
        }

        const user = users.get(normalizedEmail);

        if (!user) {
            return res.status(404).send("Usuario no encontrado");
        }

        // NUEVO: Encriptamos el '12345678' antes de guardarlo en la base de datos
        const hashedPassword = await bcrypt.hash('12345678', 10);
        user.password = hashedPassword;
        
        // Guardamos los cambios en el Map en memoria
        users.set(normalizedEmail, user);

        return res.status(200).json({ 
            message: "Contraseña restablecida correctamente", 
            email: user.email
        });
        
    } catch (error) {
        console.error("Error al restablecer contraseña en backend:", error);
        return res.status(500).json({ message: "Error interno al restablecer la contraseña" });
    }
};

module.exports = {
    getAllUsers,
    deleteUser,
    toggleUserRole,
    resetUserPassword
};