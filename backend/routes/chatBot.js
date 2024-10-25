const express = require('express');
const router = express.Router();
const messageController = require('../controllers/chatBot');

// Route to get all messages for a specific user
router.get('/:userId', messageController.getUserMessages);

// Route to send a new message
router.post('/', messageController.sendMessage);

module.exports = router;
