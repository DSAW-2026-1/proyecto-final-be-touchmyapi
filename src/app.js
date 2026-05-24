const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Forzar la inicialización de la base de datos en memoria
require('./config/db');

const app = express();

// Tomar el puerto del archivo .env 
const PORT = process.env.PORT || 8080;

// 1. Configuración dinámica de CORS para aceptar Localhost y Railway al tiempo
const whitelist = [
    process.env.FRONTEND_URL_LOCAL,
    process.env.FRONTEND_URL_PROD
];
app.use(cors()); // Permite acceso desde cualquier origen
app.use(express.json());

// Log de depuración: imprime cada petición que entra
app.use((req, res, next) => {
    console.log(`[DEBUG] Recibida: ${req.method} ${req.url}`);
    next();
});


app.use((req, res, next) => {
  console.log(`Recibida petición: ${req.method} ${req.url}`);
  next();
});
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/products', require('./routes/productRoutes'));
app.use('/api/v1/users', require('./routes/userRoutes'));
app.use('/api/v1/orders', require('./routes/orderRoutes'));

// 3. Ruta de Control de Salud de la API (Health Check)
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: "up", 
    message: "Servidor Express del Marketplace de La Sabana corriendo en memoria" 
  });
});

// 4. Encendido del Servidor en el puerto dinámico
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en el puerto ${PORT}`);
});