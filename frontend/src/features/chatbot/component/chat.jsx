 import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import io from "socket.io-client";
import { useSelector } from "react-redux";
import { selectLoggedInUser } from "../../auth/AuthSlice";

// Create socket instance with credentials
const socket = io("http://localhost:8000", {
  withCredentials: true,
});

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const loggedInUser = useSelector(selectLoggedInUser);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (loggedInUser) {
      const userId = loggedInUser?._id;

      // Login to socket with user info
      socket.emit("login", {
        userId: userId,
        role: loggedInUser.isAdmin ? "admin" : "user",
      });

      // Listen for initial messages load
      socket.on("loadMessages", (loadedMessages) => {
        setMessages(loadedMessages);
      });

      // Listen for new messages
      socket.on("newMessage", (message) => {
        setMessages((prev) => [...prev, message]);
        console.log("New Message Received:", message); // Debugging log
      });

      // Handle typing indicators
      socket.on("userTyping", ({ userId }) => {
        if (userId !== loggedInUser._id) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 2000);
        }
      });

      // Cleanup on component unmount
      return () => {
        socket.off("loadMessages");
        socket.off("newMessage");
        socket.off("userTyping");
      };
    }
  }, [loggedInUser]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const userId = loggedInUser?._id;
  
      const messageData = {
        senderId: userId,
        content: newMessage.trim(),
        role: loggedInUser.isAdmin ? "admin" : "user",
        receiverId: loggedInUser.isAdmin ? "currentUserInChat" : userId, // Replace with actual user ID if necessary
      };
  
      console.log("Sending message:", messageData);
      socket.emit("sendMessage", messageData);
      setNewMessage("");
    }
  };
   

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 80,
        right: 40,
        width: 300,
        height: 400,
        backgroundColor: "white",
        padding: 2,
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        {loggedInUser?.isAdmin ? "Admin Chat" : "Chat Support"}
      </Typography>

      <Box
        sx={{
          height: 300,
          overflowY: "auto",
          marginBottom: 1,
          padding: 1,
          backgroundColor: "#f9f9f9",
          borderRadius: 1,
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              justifyContent:
                message.senderId === loggedInUser._id ? "flex-end" : "flex-start",
              mb: 1,
            }}
          >
            <Typography
              sx={{
                backgroundColor:
                  message.senderId === loggedInUser._id ? "#3f51b5" : "#e0e0e0",
                color: message.senderId === loggedInUser._id ? "#fff" : "#000",
                padding: "8px 12px",
                borderRadius: "12px",
                maxWidth: "80%",
                wordBreak: "break-word",
              }}
            >
              {message.content} {/* Ensure you use the correct field */}
            </Typography>
          </Box>
        ))}

        {isTyping && (
          <Typography variant="caption" sx={{ color: "gray", ml: 1 }}>
            Someone is typing...
          </Typography>
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Type a message"
          size="small"
          fullWidth
          variant="outlined"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatBox;
