const { users } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const { createNotification } = require('./notificationController');

const register = async (req, res) => { 
    const { name, lastName, email, password, career, role } = req.body;

    if (!email || !password) {
        return res.status(400).send("El email y la contraseña son obligatorios.");
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (users.has(normalizedEmail)) {
        return res.status(400).send("El usuario ya está registrado con ese correo.");
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        id: uuidv4(), 
        name: name || "",
        lastName: lastName || "",
        email: normalizedEmail,
        password: hashedPassword, 
        career: career,
        role: role || "USER" 
    };

    users.set(normalizedEmail, newUser);
    return res.status(201).send("Usuario registrado con éxito");
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send("El email y la contraseña son obligatorios.");
        }

        const normalizedEmail = email.toLowerCase().trim();

        // 1. Buscar el usuario en el Map global de db.js
        const user = users.get(normalizedEmail);
        
        if (!user) {
            console.log(`[LOGIN FAILED] Usuario no encontrado: ${normalizedEmail}`);
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        // 2. Verificar la contraseña con bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            console.log(`[LOGIN FAILED] Contraseña incorrecta para: ${normalizedEmail}`);
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        console.log(`[LOGIN SUCCESS] Ingresó: ${normalizedEmail} con rol: ${user.role}`);

        // 3. ¡EL CAMBIO CRUCIAL!: Ponemos el 'return' para cortar la función aquí 
        // y mandamos los datos como un objeto JSON
        return res.status(200).json({
            id: user.id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            career: user.career,
            role: user.role
        });

    } catch (error) {
        console.error("Error en el login del servidor:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};

const changePassword = async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;
        
        const user = users.get(email.toLowerCase().trim());
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Contraseña actual incorrecta' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        
        users.set(user.email, user);

        // Alerta de cambio de contraseña exitoso
        const io = req.app.get('io');
        createNotification(
            io, 
            user.email, 
            "Tu contraseña ha sido actualizada con éxito. Si no realizaste esta acción, repórtalo de inmediato.", 
            'PASSWORD'
        );

        return res.status(200).json({ message: 'Contraseña actualizada con éxito' });
    } catch (error) {
        console.error("Error crítico en changePassword:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

module.exports = {
    register,
    login,
    changePassword
};