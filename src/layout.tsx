import { Outlet } from "react-router-dom";
import Header from "@/components/layout/client.header";
import Footer from "@/components/layout/client.footer";

const Layout = () => {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
};

export default Layout;