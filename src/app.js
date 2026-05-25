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
app.use('/api/v1/notifications', require('./routes/notificationRoutes'));

app.set('io', io);

// 3. Ruta de Control de Salud de la API (Health Check)
app.get('/health', (req, res) => {
  res.json({ 
    status: "OK", 
    microservice: "Marketplace-Unisabana-Backend", 
    memoryDb: "Active",
    socketsActive: "True" 
  });
});

// ==========================================
// LÓGICA DE WEBSOCKETS (SOCKET.IO) PARA CHAT
// ==========================================
io.on('connection', (socket) => {
  console.log(`[SOCKET] Estudiante conectado: ${socket.id}`);

  // Registrar al estudiante en su sala personal usando su Email para Notificaciones en Vivo
  socket.on('register_user', (email) => {
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      socket.join(normalizedEmail);
      console.log(`[SOCKET] Estudiante registrado en su sala de notificaciones: ${normalizedEmail}`);
    }
  });

  //  Evento para unirse a una sala única basada en el ID de la conversación (Código de tu compañero)
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`[SOCKET] Socket ${socket.id} entró a la sala de chat: ${roomId}`);
  });

  // Evento para recibir un mensaje de chat y retransmitirlo instantáneamente
  socket.on('send_message', (data) => {
    const { roomId, productId, productTitle, productImage, buyerEmail, sellerEmail, senderEmail, text } = data;

    const messagePayload = {
      id: `msg_${Date.now()}`,
      roomId,
      productId,
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

// Levantar el servidor HTTP global
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});