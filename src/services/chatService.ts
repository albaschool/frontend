import axiosInstance from "./AxiosInstance";

export const getRooms = async () => {
  const response = await axiosInstance.get("/chat");
  return response.data;
};

export const createRoom = async (roomData: {
  storeId: string;
  title: string;
}) => {
  const response = await axiosInstance.post("/chat", roomData);
  return response.data;
};

export const lastMessage = async (messageData: {
  chatRoomId: string;
  messageId: string;
}) => {
  const response = await axiosInstance.put("/chat/message/last", messageData);
  return response.data;
};

export const getMessages = async (
  id: string,
  page: string,
  messageId?: string
) => {
  const queryParams = new URLSearchParams({ page });

  if (messageId) {
    queryParams.append("messageId", messageId);
  }

  const response = await axiosInstance.get(
    `/chat/${id}?${queryParams.toString()}`
  );
  return response.data;
};
