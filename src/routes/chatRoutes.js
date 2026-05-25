const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Obtener todas las conversaciones de un usuario
router.get('/user/:email', chatController.getUserChats);

// NUEVA RUTA: Obtener mensajes de una sala específica (usada para el polling)
router.get('/room/:roomId', chatController.getRoomMessages);

// Guardar un nuevo mensaje
router.post('/', chatController.saveMessage);

module.exports = router;