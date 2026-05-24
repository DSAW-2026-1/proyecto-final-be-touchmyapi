const { users } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

// 1. Agregamos 'async' aquí
const register = async (req, res) => { 
    const { name, lastName, email, password, career, role } = req.body;

    if (!email || !password) {
        return res.status(400).send("El email y la contraseña son obligatorios.");
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (users.has(normalizedEmail)) {
        return res.status(400).send("El usuario ya está registrado con ese correo.");
    }
    
    // Ahora esto funcionará porque la función es async
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        id: uuidv4(), 
        name: name || "",
        lastName: lastName || "",
        email: normalizedEmail,
        password: hashedPassword, // Guardamos el hash
        career: career,
        role: role || "USER" 
    };

    users.set(normalizedEmail, newUser);
    return res.status(201).send("Usuario registrado con éxito");
};

// 2. Actualizamos el login para usar bcrypt.compare
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Credenciales incompletas" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = users.get(normalizedEmail);

    // Comparamos usando bcrypt
    if (user && await bcrypt.compare(password, user.password)) {
        return res.json(user);
    }

    return res.status(401).json({ message: "Credenciales incorrectas" });
};

const changePassword = async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;
        
        console.log("Datos recibidos para cambio de contraseña:", { email });
        console.log("Usuarios actualmente en memoria:", Array.from(users.keys()));

        // 1. Buscar usuario
        const user = users.get(email.toLowerCase().trim());
        if (!user) {
            console.log("Usuario no encontrado en el Map:", email);
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // 2. Verificar la contraseña actual
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        console.log("¿La contraseña actual coincide?:", isMatch);

        if (!isMatch) {
            return res.status(401).json({ message: 'Contraseña actual incorrecta' });
        }

        // 3. Hashear nueva y actualizar
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        
        users.set(user.email, user);

        return res.status(200).json({ message: 'Contraseña actualizada con éxito' });
    } catch (error) {
        console.error("Error crítico en changePassword:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = {
    register,
    login,
    changePassword
};