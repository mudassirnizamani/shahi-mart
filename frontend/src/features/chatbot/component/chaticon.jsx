// ChatIcon.js
import React from 'react';
import { IconButton } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

const ChatIconComponent = () => {
  return (
    <IconButton sx={{ position: 'fixed', bottom: 20, right: 20 }}>
      <ChatIcon />
    </IconButton>
  );
};

export default ChatIconComponent;