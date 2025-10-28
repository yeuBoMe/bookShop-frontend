import { Outlet } from "react-router-dom";
import Header from "@/components/layout/client.header";
import Footer from "@/components/layout/client.footer";
import { useState } from "react";

const Layout = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  return (
    <>
      <Header 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <Outlet context={[searchTerm, setSearchTerm]}/>
      <Footer />
    </>
  );
};

export default Layout;