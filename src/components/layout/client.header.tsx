import { useState } from "react";
import { useCurrentApp } from "components/context/app.context";
import { FiSearch, FiShoppingCart, FiUser, FiMenu } from "react-icons/fi"; // Thêm FiMenu cho hamburger
import "styles/client/client.header.scss";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { App, Avatar, Button, Drawer } from "antd"; // Thêm Drawer cho menu mobile
import { logoutAPI } from "@/services/api.service";

const Header = () => {
    const { user, setUser, setIsAuthenticated } = useCurrentApp();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const { notification, message } = App.useApp();
    const navigate = useNavigate();
    const urlAvatar = user?.avatar ? `${import.meta.env.VITE_BACKEND_URL}/upload/avatar/${user.avatar}` : "";
    const [drawerVisible, setDrawerVisible] = useState(false); // State cho menu mobile

    const handleLogoutRequest = async () => {
        try {
            const logoutResponse = await logoutAPI();
            if (logoutResponse) {
                setUser(null);
                setIsAuthenticated(false);
                localStorage.removeItem("access_token");
                message.success("Đăng xuất thành công!");
                navigate("/login");
            }
        } catch (error: any) {
            notification.error({
                message: "Error",
                description: error?.message,
                duration: 5,
                placement: "topRight"
            });
        }
    };

    return (
        <>
            <header className="header">
                {/* Top announcement bar */}
                <div className="announcementBar">
                    Miễn phí vận chuyển cho đơn hàng từ 50$ trở lên | Nhập mã <strong>WELCOME10</strong> để giảm 10%
                </div>

                {/* Main header */}
                <div className="mainHeader">
                    <div className="headerContent">
                        {/* Logo */}
                        <div className="logo">
                            <Link to="/">BookShop</Link>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <div className="mobileMenuToggle">
                            <FiMenu size={24} onClick={() => setDrawerVisible(true)} />
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="desktopNav">
                            <NavLink to="/">Trang chủ</NavLink>
                            <NavLink to="/books" end>Sản phẩm</NavLink>
                            <NavLink to="/order">Đơn hàng</NavLink>
                            <NavLink to="/profile">Hồ sơ</NavLink>
                            <NavLink to="/about">Liên hệ</NavLink>
                        </nav>

                        {/* Right side icons */}
                        <div className="icons">
                            {/* Search */}
                            <div className="searchContainer">
                                <FiSearch className="searchIcon" size={20} />
                                <input
                                    className="input-search"
                                    type="text"
                                    placeholder="Bạn tìm gì hôm nay"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Cart */}
                            {user && (
                                <button className="iconButton cartButton">
                                    <FiShoppingCart size={20} />
                                    <span className="cartBadge">3</span>
                                </button>
                            )}

                            {/* User account */}
                            <div className="userDropdown">
                                {user ? (
                                    <>
                                        {user?.avatar ? (
                                            <Avatar
                                                className="avatarIcon"
                                                src={urlAvatar}
                                                size={30}
                                                shape="circle"
                                                alt={user.fullName || "User Avatar"}
                                            />
                                        ) : (
                                            <button className="iconNoneAvatarButton">
                                                <FiUser size={20} />
                                            </button>
                                        )}

                                        <div className="dropdownMenu">
                                            <div className="userInfo">
                                                <p>Hello, {user.fullName}</p>
                                            </div>
                                            {user.role?.name === "ADMIN" && (
                                                <Link to="/admin">Trang quản trị</Link>
                                            )}
                                            <Link to="/account">Quản lý tài khoản</Link>
                                            <Link to="/orders">Lịch sử mua hàng</Link>
                                            <button
                                                className="dropdownLogout"
                                                onClick={handleLogoutRequest}
                                            >
                                                Đăng xuất
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <Button type="primary">
                                        <Link to="/login">Đăng nhập</Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Drawer for mobile menu */}
            <Drawer
                title="Menu"
                placement="right"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                width={250}
            >
                <nav className="mobileNav">
                    <NavLink to="/" onClick={() => setDrawerVisible(false)}>Trang chủ</NavLink>
                    <NavLink to="/books" onClick={() => setDrawerVisible(false)}>Sản phẩm</NavLink>
                    <NavLink to="/order" onClick={() => setDrawerVisible(false)}>Đơn hàng</NavLink>
                    <NavLink to="/profile" onClick={() => setDrawerVisible(false)}>Hồ sơ</NavLink>
                    <NavLink to="/about" onClick={() => setDrawerVisible(false)}>Liên hệ</NavLink>
                </nav>
            </Drawer>
        </>
    );
};

export default Header;