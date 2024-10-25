require('dotenv').config();
const { Server } = require('socket.io');
const Message = require('../models/message'); // Import your message model if you have one

module.exports = (server) => {
  const userSocketMap = new Map();
  const io = new Server(server, {
    cors: {
      origin: process.env.ORIGIN,
      credentials: true,
      methods: ['GET', 'POST']
    }
  })
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle user login
    socket.on('login', ({ userId, role }) => {
      console.log('User logged in:', userId, role);

      userSocketMap.set(socket.id, userId);

      if (role === 'admin') {
        socket.join('adminRoom'); // Join the admin room
      } else {
        // Load previous messages from the database if needed
        Message.find({ userId }).then((messages) => {
          socket.emit('loadMessages', messages);
        });
      }

      console.log(userSocketMap)
    });

    // Handle sending messages
    socket.on('sendMessage', async (data) => {
      try {
        const { senderId, content, role, receiverId } = data;
        let targetId = receiverId
        let senderUserId = senderId
        
        if (receiverId === "currentUserInChat") {
          senderUserId = userSocketMap.get(socket.id)
          targetId = [...userSocketMap.values()].find(id => id !== senderUserId);
        }

        // Save the message to the database
        const newMessage = new Message({
          sender: senderUserId,
          content,
          role,
          userId: targetId, 
        });
        await newMessage.save();

        // Emit to the specific user if an admin is sending the message
        if (role === "admin") {
          // socket.to(receiverId).emit("newMessage", { ...data, receiverId });

          const targetSocketId = [...userSocketMap.entries()].find(([_, id]) => id === targetId)?.[0];
          if (targetSocketId) {
            io.to(targetSocketId).emit("newMessage", { ...data, receiverId: targetId });
          }
        } else {
          // Emit to the admin room for user messages
          socket.to("adminRoom").emit("newMessage", { ...data, receiverId });
        }

        console.log('Message saved to DB:', newMessage);
      } catch (err) {
        console.error('Failed to save message:', err);
        socket.emit('error', { error: 'Failed to send message' });
      }
    });


    // Handle typing indicators
    socket.on('typing', ({ userId, role, receiverId }) => {
      socket.broadcast.emit('userTyping', { userId, role });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      userSocketMap.delete(socket.id); // Remove user from the map
    });
  });
};
