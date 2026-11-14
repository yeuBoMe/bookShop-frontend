import { useState } from "react";
import { useCurrentApp } from "components/context/app.context";
import { FiSearch, FiShoppingCart, FiUser, FiMenu } from "react-icons/fi";
import "styles/client/layout/client.header.scss";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { App, Avatar, Button, Drawer } from "antd";
import { Trans, useTranslation } from "react-i18next";
import { logoutAPI } from "@/services/api.service";
import { clearCart } from "@/services/cart.service";
import { formatPrice, getImageUrl } from "@/services/helper";
import LanguageSwitcher from "@/components/common/language.switcher";
import ThemeToggle from "@/components/common/theme.toggle";

interface HeaderProps {
    searchTerm: string;
    setSearchTerm: (v: string) => void;
}

const Header = (props: HeaderProps) => {
    const { searchTerm, setSearchTerm } = props;
    const { user, setUser, setIsAuthenticated, carts, setCarts } = useCurrentApp();
    const navigate = useNavigate();
    const { notification, message } = App.useApp();
    const { t } = useTranslation();
    const urlAvatar = user?.avatar ? getImageUrl(user.avatar) : "";
    const [drawerVisible, setDrawerVisible] = useState(false);

    const handleLogoutRequest = async () => {
        if (user?.id) {
            const allChats = JSON.parse(localStorage.getItem("bookshop_chat_history") || "{}");
            delete allChats[user.id];                    // ← xóa chỉ của user này
            localStorage.setItem("bookshop_chat_history", JSON.stringify(allChats));
        }
        try {
            const logoutResponse = await logoutAPI();
            if (logoutResponse) {
                setUser(null);
                setCarts(clearCart());
                setIsAuthenticated(false);
                localStorage.removeItem("access_token");
                message.success(t("header.logoutSuccess"));
                navigate("/login");
            }
        } catch (error: any) {
            notification.error({
                message: t("common.error"),
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

    return (
        <>
            <header className="header">
                {/* Top announcement bar */}
                <div className="announcementBar">
                    {/* Trans giữ thẻ <strong> quanh mã giảm giá ở cả hai ngôn ngữ */}
                    <Trans i18nKey="header.announcement" components={{ 1: <strong /> }} />
                </div>

                {/* Main header */}
                <div className="mainHeader">
                    <div className="headerContent">
                        {/* Logo */}
                        <div className="logo">
                            <Link to="/">{t("common.appName")}</Link>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <div className="mobileMenuToggle">
                            <FiMenu size={24} onClick={() => setDrawerVisible(true)} />
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="desktopNav">
                            <NavLink to="/">{t("nav.home")}</NavLink>
                            <NavLink to="/books" end>{t("nav.products")}</NavLink>
                            <NavLink to="/order-history">{t("nav.orders")}</NavLink>
                            <NavLink to="/profile">{t("nav.profile")}</NavLink>
                            <NavLink to="/about">{t("nav.contact")}</NavLink>
                        </nav>

                        {/* Right side icons */}
                        <div className="icons">
                            {/* Search */}
                            <div className="searchContainer">
                                <FiSearch className="searchIcon" size={20} />
                                <input
                                    className="input-search"
                                    type="text"
                                    aria-label={t("common.search")}
                                    placeholder={t("header.searchPlaceholder")}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Đổi ngôn ngữ + đổi giao diện sáng/tối — dùng chung
                                với khu quản trị, xem src/components/common */}
                            <div className="headerControls">
                                <LanguageSwitcher compact />
                                <ThemeToggle compact />
                            </div>

                            {/* Cart with Dropdown */}
                            {user && (
                                <div className="cartDropdown">
                                    <button
                                        className="iconButton cartButton"
                                        onClick={handleCartClick}
                                        aria-label={t("header.yourCart")}
                                    >
                                        <FiShoppingCart size={20} />
                                        <span className="cartBadge">{carts?.length ?? 0}</span>
                                    </button>

                                    {/* Cart Dropdown Menu - Chỉ hiển thị trên desktop */}
                                    <div className="cartDropdownMenu">
                                        {carts && carts.length > 0 ? (
                                            <>
                                                <div className="cartDropdownHeader">
                                                    <h3>{t("header.yourCart")}</h3>
                                                    <Link to={"/checkout"}>
                                                        <span className="cartItemWatch">{t("header.viewCart")}</span>
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
                                                        {t("header.moreItems", { count: carts.length - 3 })}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="emptyCart">
                                                <FiShoppingCart size={48} />
                                                <p>{t("header.emptyCart")}</p>
                                                <Link to="/books" className="shopNowButton">
                                                    {t("header.shopNow")}
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
                                            <button className="iconNoneAvatarButton" aria-label={t("nav.profile")}>
                                                <FiUser size={20} />
                                            </button>
                                        )}

                                        <div className="dropdownMenu">
                                            <div className="userInfo">
                                                <p>{t("header.greeting", { name: user.fullName })}</p>
                                            </div>

                                            {user.role?.name === "ADMIN" && (
                                                <>
                                                    <Link to="/admin">{t("header.adminArea")}</Link>
                                                    <Link to="/admin/user">{t("header.manageAccounts")}</Link>
                                                </>
                                            )}

                                            <button
                                                className="dropdownLogout"
                                                onClick={handleLogoutRequest}
                                            >
                                                {t("header.logout")}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <Button
                                        type="primary"
                                        style={{ borderRadius: "20px", paddingBottom: "3px" }}
                                    >
                                        <Link to="/login">{t("header.login")}</Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Drawer for mobile menu */}
            <Drawer
                title={t("nav.menu")}
                placement="right"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                width={250}
            >
                <nav className="mobileNav">
                    <NavLink to="/" onClick={() => setDrawerVisible(false)}>{t("nav.home")}</NavLink>
                    <NavLink to="/books" onClick={() => setDrawerVisible(false)}>{t("nav.products")}</NavLink>
                    <NavLink to="/order-history" onClick={() => setDrawerVisible(false)}>{t("nav.orders")}</NavLink>
                    <NavLink to="/profile" onClick={() => setDrawerVisible(false)}>{t("nav.profile")}</NavLink>
                    <NavLink to="/about" onClick={() => setDrawerVisible(false)}>{t("nav.contact")}</NavLink>
                </nav>

                {/* Trên điện thoại thanh trên không đủ chỗ, nên hai nút điều khiển
                    được đặt trong ngăn kéo — vẫn là cùng component */}
                <div className="mobileNavControls">
                    <LanguageSwitcher />
                    <ThemeToggle />
                </div>
            </Drawer>
        </>
    );
};

export default Header;
