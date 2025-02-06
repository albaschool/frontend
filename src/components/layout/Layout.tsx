import styled from "styled-components";
import Bottom from "./Bottom";
import Header from "./Header";
import { useEffect, useLayoutEffect, useState } from "react";
import { connectSSE } from "../../services/sseService";
import { chatNotificationStore } from "../../stores/chatNotificationStore";
import { chatIconStore } from "../../stores/chatIconStore";
import { useLocation } from "react-router-dom";

export interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const setUnreadMessages = chatNotificationStore(
    (state) => state.setUnreadMessages
  );
  const setUnreadNotifications = chatNotificationStore(
    (state) => state.setUnreadNotifications
  );
  const setShake = chatIconStore((state) => state.setShake);

  const [isChatPage, setIsChatPage] = useState(false);

  useLayoutEffect(() => {
    setIsChatPage(location.pathname.startsWith("/chats"));
  }, [location]);

  // useEffect(() => {
  //   if (isNewMessage) {
  //     scrollToBottom();
  //     const timeout = setTimeout(() => {
  //       useChatScrollStore.setState({ isNewMessage: false });
  //     }, 300);

  //     return () => clearTimeout(timeout);
  //   }
  // }, [isNewMessage]);

  useEffect(() => {
    const eventSource = connectSSE({
      onInitialize: (data) => {
        console.log("Initialize Data:", data);
        setUnreadNotifications(data);
      },
      onNotification: (data) => {
        console.log("New Notification:", data);
        setUnreadNotifications(true);
      },
      onChatRoomInitialize: (data) => {
        console.log("Chat Room Initialize Data:", data);
        setUnreadMessages(data);
      },
      onChatNotification: (data) => {
        if (isChatPage) {
          console.log("sse pass");
          return;
        } else {
          console.log("New Chat Notification:", data);
          setUnreadMessages(true);
          setShake(true);
        }
      },
    });
    return () => {
      eventSource.close();
    };
  }, []);
  return (
    <LayoutStyle>
      <Header />
      <MainStyle>{children}</MainStyle>
      <Bottom />
    </LayoutStyle>
  );
};

export default Layout;

const LayoutStyle = styled.div`
  width: 100vw;
  height: 100vh;
`;
const MainStyle = styled.div`
  margin-top: 3.5rem;
  margin-bottom: 4rem;
`;
