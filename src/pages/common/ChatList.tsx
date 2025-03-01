import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatListBox from "../../components/chat/ChatListBox";
import { Socket } from "socket.io-client";
import { IChatRoom } from "../../types/chat";
import { getToken } from "../../stores/authStore";
import { chatNotificationStore } from "../../stores/chatNotificationStore";
import { chatListTime } from "../../utils/chatListTime";
import { chatlistSocket } from "../../services/socketService";

const ChatList = () => {
  const [displayData, setDisplayData] = useState<IChatRoom[]>([]);
  const socketRef = useRef<Socket>();
  const token = getToken();
  const setUnreadMessages = chatNotificationStore(
    (state) => state.setUnreadMessages
  );

  useEffect(() => {
    socketRef.current = chatlistSocket(token as string, setDisplayData);

    return () => {
      socketRef.current?.disconnect();
    };
  }, [socketRef, token]);

  useEffect(() => {
    setUnreadMessages(false);
  }, [setUnreadMessages]);
  return (
    <ChatListStyle>
      {displayData.map((message) => (
        <ChatListBox
          key={message.id}
          id={message.id}
          storeName={message.title}
          headCount={message.memberCount}
          lastMessage={message.lastMessage || "메세지가 없습니다."}
          time={message.createdAt ? chatListTime(message.createdAt) : ""}
          badge={message.notReadCount}
        />
      ))}
    </ChatListStyle>
  );
};

export default ChatList;

const ChatListStyle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
  margin-top: 1rem;
`;
