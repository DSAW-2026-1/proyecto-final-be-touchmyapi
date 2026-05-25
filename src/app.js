const express = require('express');
const cors = require('cors');
require('dotenv').config();
const http = require('http'); // Necesario para Socket.io
const { Server } = require('socket.io'); // Necesario para Socket.io

const app = express();
const PORT = process.env.PORT || 8080;

// Configuración básica
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors()); 
app.use(express.json());

// Middlewares de log
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
app.use('/api/v1/notifications', require('./routes/notificationRoutes'));
app.use('/api/v1/users', require('./routes/userRoutes'));

// 3. Ruta de Control de Salud / Home
app.get('/', (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Servidor de Marketplace UniSabana activo.",
    microservice: "Marketplace-Unisabana-Backend",
    socketsActive: "True"
  });
});

// ==========================================
// LÓGICA DE WEBSOCKETS (SOCKET.IO)
// ==========================================
io.on('connection', (socket) => {
  console.log(`[SOCKET] Estudiante conectado: ${socket.id}`);

  // Registro para Notificaciones
  socket.on('register_user', (email) => {
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      socket.join(normalizedEmail);
    }
  });

  // Registro para Chat (código de tu compañero)
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`[SOCKET] Socket ${socket.id} entró a la sala de chat: ${roomId}`);
  });

  socket.on('send_message', (data) => {
    const { roomId, text, senderEmail } = data;
    const messagePayload = {
      id: `msg_${Date.now()}`,
      roomId,
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

// Inicio del servidor HTTP
server.listen(PORT, () => {
  console.log(`🚀 Servidor en línea en el puerto: ${PORT}`);
});