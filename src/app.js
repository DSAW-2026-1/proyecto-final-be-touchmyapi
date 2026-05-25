const express = require('express');
const cors = require('cors');
const http = require('http'); // Nativo de Node.js para acoplar WebSockets
const { Server } = require('socket.io'); // Importar Socket.io
require('dotenv').config();

// Forzar la inicialización de la base de datos en memoria
require('./config/db');

const app = express();

// Tomar el puerto del archivo .env 
const PORT = process.env.PORT || 8080;

// 1. Configuración de CORS
app.use(cors()); // Permite acceso desde cualquier origen
app.use(express.json());

// 2. Crear Servidor HTTP usando Express
const server = http.createServer(app);

// 3. Inicializar Socket.io acoplado al servidor http con soporte CORS
const io = new Server(server, {
  cors: {
    origin: "*", // Permite que React (Local o Railway) se conecte sin bloqueos
    methods: ["GET", "POST"]
  }
});

// Log de depuración: imprime cada petición que entra
app.use((req, res, next) => {
    console.log(`[DEBUG] Recibida: ${req.method} ${req.url}`);
    next();
});

// Rutas de la API Existentes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/products', require('./routes/productRoutes'));
app.use('/api/v1/users', require('./routes/userRoutes'));
app.use('/api/v1/orders', require('./routes/orderRoutes'));
app.use('/api/v1/reviews', require('./routes/reviewRoutes'));
const chatRoutes = require('./routes/chatRoutes');
app.use('/api/v1/chats', chatRoutes);

// 3. Ruta de Control de Salud de la API (Health Check)
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: "up", 
    message: "Servidor Express del Marketplace de La Sabana corriendo en memoria con WebSockets activos" 
  });
});

// ==========================================
// LÓGICA DE WEBSOCKETS (SOCKET.IO) PARA CHAT
// ==========================================
io.on('connection', (socket) => {
  console.log(`[SOCKET] Estudiante conectado: ${socket.id}`);

  // Evento para unirse a una sala única basada en el ID de la conversación
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`[SOCKET] Socket ${socket.id} entró a la sala: ${roomId}`);
  });

  // Evento para recibir un mensaje y retransmitirlo instantáneamente
// Modifica el evento send_message para que retransmita el contexto completo si es necesario
socket.on('send_message', (data) => {
  const { roomId, productId, productTitle, productImage, buyerEmail, sellerEmail, senderEmail, text } = data;

  const messagePayload = {
    id: `msg_${Date.now()}`,
    roomId,          // <-- Útil para que el front verifique la sala activa
    productId,       // <-- Útil si el front necesita refrescar datos del producto
    senderEmail,
    text,
    timestamp: new Date().toISOString()
  };

  io.to(roomId).emit('receive_message', messagePayload);
});

  socket.on('disconnect', () => {
    console.log(`[SOCKET] Estudiante desconectado: ${socket.id}`);
  });
});

// 4. Encendido del Servidor usando 'server.listen' en lugar de 'app.listen'
server.listen(PORT, () => {
  console.log(`Servidor backend escuchando en el puerto ${PORT} (WebSockets Habilitados)`);
});