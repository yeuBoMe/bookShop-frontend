import { Outlet, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "@/components/layout/client.header";
import Footer from "@/components/layout/client.footer";
import { useEffect, useState, useRef } from "react";
import { App } from "antd";
import { useCurrentApp } from "@/components/context/app.context";
import { getAccountInfoAPI } from "@/services/api.service";
import ChatbotPopup from "@/components/client/chatbot/chatbot";
import UserChatWebSocket from "@/components/client/websocket/user.chat";

const Layout = () => {
  const { user } = useCurrentApp();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchParams, setSearchParams] = useSearchParams();
  const { message } = App.useApp();

  const { t } = useTranslation();
  const { setUser, setIsAuthenticated } = useCurrentApp();

  const hasProcessedLogin = useRef(false);

  useEffect(() => {
    handleGoogleLogin();
  }, []);

  const handleGoogleLogin = async () => {
    const accessToken = searchParams.get('access_token');
    const googleLogin = searchParams.get('google_login');

    // ✅ Kiểm tra đã xử lý chưa
    if (!accessToken || !googleLogin || hasProcessedLogin.current) {
      return;
    }

    // ✅ Đánh dấu đang xử lý
    hasProcessedLogin.current = true;

    try {
      // Lưu access token
      localStorage.setItem('access_token', accessToken);

      // Lấy thông tin user
      const accountResponse = await getAccountInfoAPI();

      if (accountResponse?.data) {
        const mappedUser: IUser = {
          id: accountResponse.data.user.id,
          fullName: accountResponse.data.user.name,
          email: accountResponse.data.user.email,
          avatar: accountResponse.data.user.avatar || "",
          phone: accountResponse.data.user.phone || "",
          role: accountResponse.data.user.role,
        };

        setUser(mappedUser);
        setIsAuthenticated(true);

        message.success(t("error.googleLoginSuccess"));
      }

    } catch {
      message.error(t("error.googleLoginFail"));

      // ✅ Reset flag nếu lỗi để có thể retry
      hasProcessedLogin.current = false;
    } finally {
      // ✅ Xóa params sau khi xử lý xong
      searchParams.delete('access_token');
      searchParams.delete('google_login');
      setSearchParams(searchParams, { replace: true });
    }
  };

  return (
    <>
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <Outlet context={[searchTerm, setSearchTerm]} />
      <ChatbotPopup />
      {
        user && user.role?.name !== "ADMIN"
          ? <>
            <UserChatWebSocket />
          </>
          : <></>
      }
      <Footer />
    </>
  );
};

export default Layout;