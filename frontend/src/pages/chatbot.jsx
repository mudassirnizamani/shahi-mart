// App.js
import React, { useState } from 'react';
import ChatIconComponent from '../features/chatbot/component/chaticon';
import ChatBox from '../features/chatbot/component/chat';

export const Chatbot = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleToggleChat = () => {
    setIsChatOpen((prevIsChatOpen) => !prevIsChatOpen);
  };

  return (
    <div>
      <ChatIconComponent onClick={handleToggleChat} />
      {/* {isChatOpen?<ChatBox />:<></>} */}
      <ChatBox />
    </div>
  );
};
