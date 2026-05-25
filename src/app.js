const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors()); 
app.use(express.json());

// Middlewares de log (opcional, como en tu archivo original)
app.use((req, res, next) => {
    console.log(`[DEBUG] Recibida: ${req.method} ${req.url}`);
    next();
});

// Rutas
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/products', require('./routes/productRoutes'));
app.use('/api/v1/orders', require('./routes/orderRoutes'));
app.use('/api/v1/reviews', require('./routes/reviewRoutes'));
app.use('/api/v1/chats', require('./routes/chatRoutes'));

app.get('/', (req, res) => {
  res.json({ 
    status: "online", 
    message: "Servidor de Marketplace UniSabana activo." 
  });
});

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor en línea en el puerto: ${PORT}`);
});