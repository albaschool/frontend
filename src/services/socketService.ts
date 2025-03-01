import { io, Socket } from "socket.io-client";
import { IChatRoom, Message } from "../types/chat";

export const chatroomSocket = (
  roomId: string,
  token: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setUnreadMessages: (status: boolean) => void,
  setShake: (status: boolean) => void
) => {
  const socket: Socket = io(`${import.meta.env.VITE_BACKEND_URL}/room`, {
    path: "/socket.io/",
    transports: ["websocket"],
    auth: { token: `Bearer ${token}` },
  });

  if (!socket || !roomId) return null;

  socket.on("connect", () => {
    console.log("소켓 연결 완료", socket.id);
    socket.emit("joinRoom", { roomId });
  });

  socket.on("newMessage", (data) => {
    console.log("새 메시지 수신", data);
    setUnreadMessages(true);
    setShake(true);
  });

  socket.on("broadcast", (newMessage) => {
    setMessages((prevMessages: Message[]) => [
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

  return socket;
};

export const chatlistSocket = (
  token: string,
  setDisplayData: React.Dispatch<React.SetStateAction<IChatRoom[]>>
): Socket => {
  const socket: Socket = io(`${import.meta.env.VITE_BACKEND_URL}/chat`, {
    path: "/socket.io/",
    transports: ["websocket"],
    auth: {
      token: `Bearer ${token}`,
    },
  });

  socket.on("connect", () => {
    console.log("소켓 연결 완료", socket.id);
  });

  socket.on("initialize", (initialData) => {
    setDisplayData(initialData.data);
  });

  socket.on("chatLists", (updatedChatLists) => {
    setDisplayData(updatedChatLists.data);
  });

  return socket;
};
