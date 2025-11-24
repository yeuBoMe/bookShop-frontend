import { Outlet, useSearchParams } from "react-router-dom";
import Header from "@/components/layout/client.header";
import Footer from "@/components/layout/client.footer";
import { useEffect, useState, useRef } from "react";
import { App } from "antd";
import { useCurrentApp } from "@/components/context/app.context";
import { getAccountInfoAPI } from "@/services/api.service";
import ChatbotPopup from "@/components/client/chatbot/chatbot";

const Layout = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchParams, setSearchParams] = useSearchParams();
  const { message } = App.useApp();
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
      console.log('>>> Processing Google login...');

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

        message.success('Đăng nhập Google thành công!');
        console.log('>>> Google login success:', mappedUser);
      }

    } catch (error: any) {
      console.error('>>> Google login error:', error);
      message.error('Có lỗi xảy ra khi đăng nhập với Google');

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
      <Footer />
    </>
  );
};

export default Layout;