import { useState } from "react";
import { useCurrentApp } from "components/context/app.context";
import { FiSearch, FiShoppingCart, FiUser } from "react-icons/fi";
import "styles/client.header.scss";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { App, Avatar, Button } from "antd";
import { logoutAPI } from "@/services/api.service";

const Header = () => {
    const { user, setUser, setIsAuthenticated } = useCurrentApp();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const { notification, message } = App.useApp();
    const navigate = useNavigate();
    const urlAvatar = user?.avatar ? `${import.meta.env.VITE_BACKEND_URL}/upload/avatar/${user.avatar}` : "";

    const handleLogoutRequest = async () => {
        try {
            const logoutResponse = await logoutAPI();
            if (logoutResponse) {
                setUser({
                    id: 0,
                    fullName: "",
                    email: "",
                    avatar: "",
                    phone: "",
                    role: {
                        id: 0,
                        name: "",
                    },
                });

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
    }

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

                        {/* Desktop Navigation */}
                        <nav className="desktopNav">
                            <NavLink to="/">Trang chủ</NavLink>
                            <NavLink to="/book">Sách</NavLink>
                            <NavLink to="/collections">Collections</NavLink>
                            <NavLink to="/about">About</NavLink>
                            <NavLink to="/contact">Contact</NavLink>
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
            </header >
        </>
    );
};

export default Header;