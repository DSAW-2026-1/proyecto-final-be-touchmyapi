const { users } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const register = (req, res) => {
    const { name, lastName, email, password, career, role } = req.body;

    // 1. Validar datos requeridos básicos
    if (!email || !password) {
        return res.status(400).send("El email y la contraseña son obligatorios.");
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Validar si el usuario ya existe
    if (users.has(normalizedEmail)) {
        return res.status(400).send("El usuario ya está registrado con ese correo.");
    }

    // 3. Crear el nuevo usuario 
    const newUser = {
        id: uuidv4(), 
        name: name || "",
        lastName: lastName || "",
        email: normalizedEmail,
        password: password,
        career: career,
        role: role || "USER" 
    };

    // 4. Guardar en nuestra "BD" en memoria
    users.set(normalizedEmail, newUser);

    return res.status(201).send("Usuario registrado con éxito");
};

const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Credenciales incompletas" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = users.get(normalizedEmail);

    // Validamos que el usuario exista y que la contraseña coincida estrictamente
    if (user && user.password === password) {
        
        return res.json(user);
    }

    // Si falla, devolvemos 401 Unauthorized
    return res.status(401).json({ message: "Credenciales incorrectas" });
};

module.exports = {
    register,
    login
};