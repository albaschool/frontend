import { GlobalStyle } from "./styles/global";
import Layout from "./components/layout/Layout";
import StaffRegisterStore from "./pages/staff/RegisterStore";
import ManagerRegisterStore from "./pages/manager/RegisterStore";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/common/Home";
import StaffUser from "./pages/staff/User";
import ManagerUser from "./pages/manager/User";
import UserEdit from "./pages/common/UserEdit";
import ChatList from "./pages/common/ChatList";
import ChatRoom from "./pages/common/ChatRoom"
import ManagerSchedule from "./pages/manager/schedule/ManagerSchedule";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./styles/theme";
import Notice from "./pages/common/Notice";
import ShopList from "./pages/common/ShopList";
import Login from "./pages/common/Login";
import StaffSignUp from "./pages/staff/StaffSignUp";
import ManagerSignUp from "./pages/manager/ManagerSignUp";
import StaffEduList from "./pages/staff/StaffEduList";
import ManagerEduList from "./pages/manager/ManagerEduList";
import ChangePwd from "./pages/common/ChangePwd";
import StaffEduPost from "./pages/staff/StaffEduPost";
import ManagerEduPost from "./pages/manager/ManagerEduPost";
import WritePost from "./pages/manager/WritePost";

function App() {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/user/changepwd" element={<ChangePwd />} />
            <Route path="/staff/signup" element={<StaffSignUp />} />
            <Route path="/manager/signup" element={<ManagerSignUp/>} />
            <Route path="/staff/edulist" element={<StaffEduList />} />
            <Route path="/manager/edulist" element={<ManagerEduList/>} />
            <Route path="/staff/edupost" element={<StaffEduPost />} />
            <Route path="/manager/edupost" element={<ManagerEduPost />} />
            <Route path="/manager/post" element={<WritePost />} />
            <Route path="/store/register/staff" element={<StaffRegisterStore />} />
            <Route path="/store/register/manager" element={<ManagerRegisterStore />} />
            <Route path="/schedule/manager" element={<ManagerSchedule />} />
            <Route path="/notice" element={<Notice />} />
            <Route path="/shop-list" element={<ShopList />} />
            <Route path="/user/staff" element={<StaffUser />} />
            <Route path="/user/manager" element={<ManagerUser />} />
            <Route path="/user/edit" element={<UserEdit />} />
            <Route path="/chats" element={<ChatList />} />
            <Route path="/chats/:id" element={<ChatRoom />} />
          </Routes>
        </Layout>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
