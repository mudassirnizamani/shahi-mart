require('dotenv').config();
const { Server } = require('socket.io');
const Message = require('../models/message'); // Import your message model if you have one

module.exports = (server) => {
  
  const io = new Server(server,{cors:{ 
    origin: process.env.ORIGIN, 
    credentials: true,  
    methods: ['GET', 'POST'] 
  }})
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle user login
    socket.on('login', ({ userId, role }) => {
      console.log('User logged in:', userId, role);
      
      if (role === 'admin') {
        socket.join('adminRoom'); // Join the admin room
      } else {
        // Load previous messages from the database if needed
        Message.find({ userId }).then((messages) => {
          socket.emit('loadMessages', messages);
        });
      }
    });

    // Handle sending messages
    socket.on('sendMessage', async (data) => {
      try {
        const { senderId, content, role, receiverId } = data;
        console.log(role) 
        console.log(recieverId)  
        console.log(senderId)
    
        // Save the message to the database
        const newMessage = new Message({
          sender: senderId,
          content,
          role,
          userId: receiverId, // This is the ID of the user receiving the message
        });
        await newMessage.save();


        // Emit to the specific user if an admin is sending the message
        if (role === "admin") {
          socket.to(receiverId).emit("newMessage", { ...data, receiverId });
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
    });
  });
};
