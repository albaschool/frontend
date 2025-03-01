import styled from "styled-components";
import ArrowBackIosOutlinedIcon from "@mui/icons-material/ArrowBackIosOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import ChatContainer from "../../components/chat/ChatContainer";
import ChatMenu from "../../components/chat/ChatMenu";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { getMessages } from "../../services/chatService";
import { IChatMember, Message } from "../../types/chat";
import { getToken } from "../../stores/authStore";
import { chatNotificationStore } from "../../stores/chatNotificationStore";
import { chatIconStore } from "../../stores/chatIconStore";

const ChatRoom = () => {
  const roomId = useParams().id;
  const navigate = useNavigate();
  const location = useLocation();
  const { storeName = "Unknown Store", headCount = 0 } = location.state || {};
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [members, setMembers] = useState<IChatMember[]>([]);
  const token = getToken();
  const setUnreadMessages = chatNotificationStore(
    (state) => state.setUnreadMessages
  );
  const setShake = chatIconStore((state) => state.setShake);

  const socketRef = useRef<Socket>();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [isLoadingOldMessages, setIsLoadingOldMessages] = useState(false);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      console.log("Set scrollTop to:", scrollContainerRef.current.scrollHeight);
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
      console.log("scrollTop after:", scrollContainerRef.current.scrollTop);
    }
  };

  useEffect(() => {
    if (!isLoadingOldMessages) {
      scrollToBottom();
    }
  }, [messages]);

  const fetchMessages = async () => {
    if (!roomId) return;

    const fetchedMessages = await getMessages(
      roomId,
      page.toString(),
      lastMessageId || undefined
    );
    console.log(fetchedMessages);

    if (fetchedMessages.chatRoomDetail.messages.length === 0) {
      setHasMore(false);
      return;
    }

    if (!lastMessageId) {
      const lastFetchedMessage =
        fetchedMessages.chatRoomDetail.messages.slice(-1)[0];
      if (lastFetchedMessage) {
        setLastMessageId(lastFetchedMessage.id);
      }
    }

    setMessages((prevMessages) => [
      ...fetchedMessages.chatRoomDetail.messages,
      ...prevMessages,
    ]);
    setMembers(fetchedMessages.chatRoomDetail.members);

    setPage((prevPage) => prevPage + 1);
  };

  const fetchMoreMessages = async () => {
    if (!scrollContainerRef.current) return;

    setIsLoadingOldMessages(true);

    //메세지 로드 전 스크롤 위치 저장
    const container = scrollContainerRef.current;
    const previousScrollHeight = container.scrollHeight;
    const previousScrollTop = container.scrollTop;

    await fetchMessages();

    //메세지 로드 후 스크롤 원위치
    setTimeout(() => {
      container.scrollTop =
        container.scrollHeight - previousScrollHeight + previousScrollTop;
      setIsLoadingOldMessages(false);
    }, 0);
  };

  const setupSocket = () => {
    socketRef.current = io(`${import.meta.env.VITE_BACKEND_URL}/room`, {
      path: "/socket.io/",
      transports: ["websocket"],
      auth: {
        token: `Bearer ${token}`,
      },
    });

    const socket = socketRef.current;
    if (!socket || !roomId) return;

    socket.on("connect", () => {
      console.log("연결 완료", socket.id);
      socket.emit("joinRoom", { roomId: roomId });
    });

    socket.on("newMessage", (data) => {
      console.log(data);
      setUnreadMessages(true);
      setShake(true);
    });

    socket.on("broadcast", (newMessage) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          content: newMessage.content,
          createdAt: new Date().toISOString(),
          id: newMessage.messageId,
          senderId: newMessage.senderId,
          name: newMessage.name,
        },
      ]);
    });

    return () => {
      socket.emit("leaveRoom", { roomId: roomId });
      socket.disconnect();
    };
  };

  useEffect(() => {
    fetchMessages();
    setupSocket();
  }, [roomId, token]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !socketRef.current) return;

    socketRef.current.emit("broadcast", {
      content: inputMessage,
      roomId: roomId,
    });
    setInputMessage("");
  };

  const inputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
  };

  const goToChatList = () => {
    navigate("/chats");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const autoResize = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = event.target;

    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  };

  //무한 스크롤
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop === 0 && hasMore) {
        console.log("맨 위 감지! 메시지 로드 호출");
        fetchMoreMessages();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [page, hasMore]);

  return (
    <ChatRoomContainer ref={scrollContainerRef}>
      <ChatRoomHeaderStyle>
        {menuOpen && <ChatMenu toggleMenu={toggleMenu} members={members} />}

        <ArrowBackIosOutlinedIcon onClick={goToChatList} />
        <span>
          <h6>{storeName}</h6>
          <h6 style={{ color: "#7E7E7E", fontWeight: "100" }}>{headCount}</h6>
        </span>
        <MenuOutlinedIcon sx={{ fontSize: 28 }} onClick={toggleMenu} />
      </ChatRoomHeaderStyle>
      <ChatContainer messages={messages} members={members} />
      <ChatInputBoxStyle>
        <textarea
          id="message"
          rows={1}
          onInput={autoResize}
          value={inputMessage}
          onChange={inputChange}
        ></textarea>
        <button onClick={sendMessage}>전송</button>
      </ChatInputBoxStyle>
    </ChatRoomContainer>
  );
};

export default ChatRoom;

const ChatRoomContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 85%;
  overflow-y: auto;
`;

const ChatRoomHeaderStyle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  padding: 0.8rem;
  border-bottom: 1px solid #cdcdcd;
  background-color: #ffffff;
  width: 100%;
  z-index: 10;

  span {
    display: inline-flex;
    gap: 0.5rem;
  }

  h6 {
    font-size: 1.25rem;
  }
`;

const ChatInputBoxStyle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  position: fixed;
  padding: 0.5rem 0.6rem;
  border-top: 1px solid #cdcdcd;
  background-color: #ffffff;
  width: 100%;
  bottom: 3.9rem;

  textarea {
    resize: none;
    border: 1px solid #cdcdcd;
    border-radius: 10px;
    padding: 0.55rem 0.8rem;
    font-size: 1.1rem;
    width: 81%;
    overflow-y: hidden;
    max-height: 4.4rem;
  }

  button {
    font-size: 1rem;
    padding: 0.55rem 1rem;
    background-color: #faed7d;
    border: 1px solid #cdcdcd;
    border-radius: 10px;

    &:focus,
    &:hover {
      background-color: #ffd400;
    }
  }
`;
