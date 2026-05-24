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

const corsOptions = {
  origin: function (origin, callback) {
    // Permite peticiones sin origen (como Postman) o si están en la lista blanca
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por políticas de CORS - Marketplace Sabana Backend'));
    }
  },
  credentials: true
};

// 2. Middlewares Globales
app.use(cors(corsOptions));
app.use(express.json()); // Crucial para procesar los @RequestBody que manda React en JSON

app.use('/api/v1/auth', require('./routes/authRoutes'));

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