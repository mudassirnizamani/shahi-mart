const Message = require('../models/message');

// Get all messages for a user
exports.getUserMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({ userId }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving messages', error });
  }
};

// Send a new message
// Controller - Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const { userId, sender, content, role } = req.body;

    // Validate required fields
    if (!userId || !sender || !content || !role) {
      return res.status(400).json({ message: 'Missing required fields: userId, sender, content, and role' });
    }

    // Create a new message with validated data
    const message = new Message({ userId, sender, content, role });
    
    // Save to the database
    await message.save();
    
    // Respond with the saved message
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message', error });
  }
};
