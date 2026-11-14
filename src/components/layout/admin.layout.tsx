import { useEffect, useState } from 'react';
import {
    AppstoreOutlined,
    ExceptionOutlined,
    HeartTwoTone,
    TeamOutlined,
    DollarCircleOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    HomeOutlined,
    StarOutlined,
    MessageOutlined,
    ReadOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Dropdown, Avatar, App, Grid } from 'antd';
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useCurrentApp } from 'components/context/app.context';
import type { MenuProps } from 'antd';
import { logoutAPI } from '@/services/api.service';
import { clearCart } from '@/services/cart.service';
import { getImageUrl } from '@/services/helper';
import LanguageSwitcher from '@/components/common/language.switcher';
import ThemeToggle from '@/components/common/theme.toggle';
import ThemedConfigProvider from '@/components/layout/themed.config.provider';
import 'styles/admin/admin.layout.scss';

type MenuItem = Required<MenuProps>['items'][number];

const { Content, Footer, Sider } = Layout;
const { useBreakpoint } = Grid;

const AdminLayout = () => {
    const { user, setUser, setIsAuthenticated, setCarts } = useCurrentApp();
    const location = useLocation();
    const navigate = useNavigate();
    const { notification, message } = App.useApp();
    const screens = useBreakpoint();
    const { t } = useTranslation();

    // Trên màn nhỏ thanh bên đóng sẵn và mở ra dạng ngăn kéo;
    // trên desktop mặc định mở.
    const isDesktop = !!screens.lg;
    const [collapsed, setCollapsed] = useState<boolean>(!isDesktop);

    useEffect(() => {
        setCollapsed(!isDesktop);
    }, [isDesktop]);

    // Modal / Drawer / Dropdown của antd render ra portal ở cuối <body>, nằm
    // ngoài .layout-admin nên không nhận được CSS phạm vi admin. Đánh dấu trên
    // <body> để những phần đó cũng theo tông xanh lá, và gỡ ra khi rời khu admin.
    useEffect(() => {
        document.body.classList.add('admin-theme');
        return () => document.body.classList.remove('admin-theme');
    }, []);

    // Chọn mục menu khớp với đường dẫn dài nhất (để /admin/user vẫn đúng
    // khi có thêm route con), thay vì so sánh bằng tuyệt đối như trước.
    const activeMenu = [
        '/admin/user',
        '/admin/book',
        '/admin/order',
        '/admin/category',
        '/admin/rating',
        '/admin/chat',
    ].find((key) => location.pathname.startsWith(key)) ?? '/admin';

    // Điều hướng xong thì tự đóng ngăn kéo trên mobile
    useEffect(() => {
        if (!isDesktop) setCollapsed(true);
    }, [location.pathname, isDesktop]);

    const handleLogoutRequest = async () => {
        if (user?.id) {
            const allChats = JSON.parse(localStorage.getItem("bookshop_chat_history") || "{}");
            delete allChats[user.id];
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
                placement: "topRight",
            });
        }
    }

    const items: MenuItem[] = [
        { label: <Link to="/admin">{t('admin.nav.overview')}</Link>, key: '/admin', icon: <HomeOutlined /> },
        { label: <Link to="/admin/user">{t('admin.nav.accounts')}</Link>, key: '/admin/user', icon: <TeamOutlined /> },
        { label: <Link to="/admin/book">{t('admin.nav.books')}</Link>, key: '/admin/book', icon: <ReadOutlined /> },
        { label: <Link to="/admin/category">{t('admin.nav.categories')}</Link>, key: '/admin/category', icon: <AppstoreOutlined /> },
        { label: <Link to="/admin/order">{t('admin.nav.orders')}</Link>, key: '/admin/order', icon: <DollarCircleOutlined /> },
        { label: <Link to="/admin/rating">{t('admin.nav.ratings')}</Link>, key: '/admin/rating', icon: <StarOutlined /> },
        { label: <Link to="/admin/chat">{t('admin.nav.messages')}</Link>, key: '/admin/chat', icon: <MessageOutlined /> },
    ];

    const itemsDropdown: MenuProps['items'] = [
        { label: <Link to="/admin/user">{t('header.manageAccounts')}</Link>, key: 'account' },
        { label: <Link to="/">{t('admin.backToShop')}</Link>, key: 'home' },
        { type: 'divider' },
        { label: t('header.logout'), key: 'logout', danger: true, onClick: handleLogoutRequest },
    ];

    const ToggleIcon = collapsed ? MenuUnfoldOutlined : MenuFoldOutlined;

    return (
        // ConfigProvider lồng bên trong bản ở main.tsx: chỉ khu quản trị đổi
        // sang bảng màu xanh lá, trang bán hàng vẫn giữ xanh dương.
        <ThemedConfigProvider area="admin">
            <Layout className="layout-admin">
                <Sider
                    theme="light"
                    width={232}
                    collapsible={isDesktop}
                    collapsed={isDesktop ? collapsed : false}
                    onCollapse={setCollapsed}
                    trigger={isDesktop ? undefined : null}
                    className={`admin-sider${!isDesktop && collapsed ? ' is-collapsed' : ''}`}
                >
                    <div className="admin-sider__brand">
                        <span className="brand-mark"><ExceptionOutlined /></span>
                        {(!collapsed || !isDesktop) && (
                            <span className="brand-text">
                                <strong>{t('common.appName')}</strong>
                                <span>{t('admin.brandSubtitle')}</span>
                            </span>
                        )}
                    </div>
                    <Menu selectedKeys={[activeMenu]} mode="inline" items={items} />
                </Sider>

                {/* Lớp phủ chỉ xuất hiện khi ngăn kéo đang mở trên màn nhỏ */}
                {!isDesktop && !collapsed && (
                    <button
                        type="button"
                        aria-label={t('common.close')}
                        className="admin-sider__backdrop"
                        onClick={() => setCollapsed(true)}
                    />
                )}

                <Layout>
                    <div className="admin-header">
                        <button
                            type="button"
                            className="admin-header__toggle"
                            aria-label={collapsed ? t('admin.openMenu') : t('admin.closeMenu')}
                            aria-expanded={!collapsed}
                            onClick={() => setCollapsed(!collapsed)}
                        >
                            <ToggleIcon />
                        </button>

                        <div className="admin-header__actions">
                            {/* Hai nút này dùng chung với trang bán hàng, chỉ khác
                                bảng màu do body.admin-theme ghi đè biến CSS */}
                            <LanguageSwitcher />
                            <ThemeToggle />

                            <Dropdown menu={{ items: itemsDropdown }} trigger={['click']} placement="bottomRight">
                                <div className="admin-header__user" role="button" tabIndex={0}>
                                    <Avatar src={getImageUrl(user?.avatar)} size={32} />
                                    <span className="user-name">{user?.fullName}</span>
                                </div>
                            </Dropdown>
                        </div>
                    </div>

                    <Content className="admin-content">
                        <Outlet />
                    </Content>

                    <Footer className="admin-footer">
                        {t('admin.footer')} <HeartTwoTone twoToneColor="#dc2626" />
                    </Footer>
                </Layout>
            </Layout>
        </ThemedConfigProvider>
    );
};

export default AdminLayout;
