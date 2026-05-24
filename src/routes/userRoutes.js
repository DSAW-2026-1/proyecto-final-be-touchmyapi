const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAllUsers);
router.delete('/:email', userController.deleteUser);
router.patch('/:email/toggle-role', userController.toggleUserRole); // patch para actualizaciones parciales

module.exports = router;