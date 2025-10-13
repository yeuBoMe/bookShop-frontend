import { useState } from "react";
import { useCurrentApp } from "components/context/app.context";
import { FiSearch, FiShoppingCart, FiUser, FiMenu } from "react-icons/fi";
import "styles/client/layout/client.header.scss";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { App, Avatar, Button, Drawer } from "antd";
import { logoutAPI } from "@/services/api.service";

const Header = () => {
    const { user, setUser, setIsAuthenticated, carts } = useCurrentApp();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const { notification, message } = App.useApp();
    const navigate = useNavigate();
    const urlAvatar = user?.avatar ? `${import.meta.env.VITE_BACKEND_URL}/upload/avatar/${user.avatar}` : "";
    const [drawerVisible, setDrawerVisible] = useState(false);

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

    // Xử lý click vào giỏ hàng trên mobile
    const handleCartClick = () => {
        // Kiểm tra xem có phải mobile không
        if (window.innerWidth <= 768) {
            navigate("/checkout");
        }
    };

    // Format price to VND
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
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
                            <NavLink to="/order-history">Đơn hàng</NavLink>
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

                            {/* Cart with Dropdown */}
                            {user && (
                                <div className="cartDropdown">
                                    <button
                                        className="iconButton cartButton"
                                        onClick={handleCartClick}
                                    >
                                        <FiShoppingCart size={20} />
                                        <span className="cartBadge">{carts?.length ?? 0}</span>
                                    </button>

                                    {/* Cart Dropdown Menu - Chỉ hiển thị trên desktop */}
                                    <div className="cartDropdownMenu">
                                        {carts && carts.length > 0 ? (
                                            <>
                                                <div className="cartDropdownHeader">
                                                    <h3>Giỏ hàng của bạn</h3>
                                                    <Link to={"/checkout"}>
                                                        <span className="cartItemWatch">Xem giỏ hàng</span>
                                                    </Link>
                                                </div>

                                                <div className="cartItemsList">
                                                    {carts.slice(0, 3).map((item) => (
                                                        <div key={item.id} className="cartItem">
                                                            <div className="cartItemInfo">
                                                                <h4 className="cartItemTitle">
                                                                    {item.detail.name}
                                                                </h4>
                                                                <div className="cartItemDetails">
                                                                    <span className="cartItemQuantity">
                                                                        x{item.quantity}
                                                                    </span>
                                                                    <span className="cartItemPrice">
                                                                        {formatPrice(item.detail?.price * item.quantity)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {carts.length > 3 && (
                                                    <div className="cartMoreItems">
                                                        +{carts.length - 3} sản phẩm khác
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="emptyCart">
                                                <FiShoppingCart size={48} />
                                                <p>Giỏ hàng trống</p>
                                                <Link to="/books" className="shopNowButton">
                                                    Mua sắm ngay
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
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
                                            <button
                                                className="dropdownLogout"
                                                onClick={handleLogoutRequest}
                                            >
                                                Đăng xuất
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <Button
                                        type="primary"
                                        style={{ borderRadius: "20px" }}
                                    >
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
                    <NavLink to="/order-history" onClick={() => setDrawerVisible(false)}>Đơn hàng</NavLink>
                    <NavLink to="/profile" onClick={() => setDrawerVisible(false)}>Hồ sơ</NavLink>
                    <NavLink to="/about" onClick={() => setDrawerVisible(false)}>Liên hệ</NavLink>
                </nav>
            </Drawer>
        </>
    );
};

export default Header;