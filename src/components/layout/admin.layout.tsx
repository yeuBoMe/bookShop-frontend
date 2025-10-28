import React, { useEffect, useState } from 'react';
import {
    AppstoreOutlined,
    ExceptionOutlined,
    HeartTwoTone,
    TeamOutlined,
    UserOutlined,
    DollarCircleOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Dropdown, Space, Avatar, App } from 'antd';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { useCurrentApp } from 'components/context/app.context';
import type { MenuProps } from 'antd';
import { logoutAPI } from '@/services/api.service';

type MenuItem = Required<MenuProps>['items'][number];

const { Content, Footer, Sider } = Layout;

const AdminLayout = () => {
    const { user, setUser, setIsAuthenticated, setCarts } = useCurrentApp();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const { notification, message } = App.useApp();
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState<string>('dashboard');
    const urlAvatar = `${import.meta.env.VITE_BACKEND_URL}/upload/avatar/${user?.avatar}`;

    console.log(">>> ", location.pathname);

    useEffect(() => {
        const active: any = items.find(item => location.pathname === (item!.key as any)) ?? "/admin";
        setActiveMenu(active.key);
    }, [location]);

    const handleLogoutRequest = async () => {
        try {
            const logoutResponse = await logoutAPI();
            if (logoutResponse) {
                setUser(null);
                setCarts([]);
                setIsAuthenticated(false);
                localStorage.removeItem("access_token");
                localStorage.removeItem("carts");
                message.success("Đăng xuất thành công!");
                navigate("/login");
            }
        } catch (error: any) {
            notification.error({
                message: "Error",
                description: error?.message,
                duration: 5,
                placement: "topRight",
            });
        }
    }

    const items: MenuItem[] = [
        {
            label: <Link to='/admin'>Dashboard</Link>,
            key: '/admin',
            icon: <AppstoreOutlined />,
        },
        {
            label: 'Manage Users',
            key: '/admin/user',
            icon: <UserOutlined />,
            children: [
                {
                    label: <Link to='/admin/user'>CRUD</Link>,
                    key: '/admin/user',
                    icon: <TeamOutlined />,
                },
            ],
        },
        {
            label: <Link to='/admin/book'>Manage Books</Link>,
            key: '/admin/book',
            icon: <ExceptionOutlined />,
        },
        {
            label: <Link to='/admin/order'>Manage Orders</Link>,
            key: '/admin/order',
            icon: <DollarCircleOutlined />,
        },
    ];

    const itemsDropdown = [
        {
            label: (
                <label
                    style={{ cursor: 'pointer' }}
                >
                    <Link
                        to={"/admin/user"}
                        style={{ color: "black" }}
                    >
                        Quản lý tài khoản
                    </Link>
                </label>
            ),
            key: 'account',
        },
        {
            label: <Link to={'/'}>Trang chủ</Link>,
            key: 'home',
        },
        {
            label: (
                <label
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleLogoutRequest()}
                >
                    Đăng xuất
                </label>),
            key: 'logout',
        },
    ];

    return (
        <>
            <Layout
                style={{ minHeight: '100vh' }}
                className="layout-admin"
            >
                <Sider
                    theme='light'
                    collapsible
                    collapsed={collapsed}
                    onCollapse={(value) => setCollapsed(value)}>
                    <div style={{
                        height: 32,
                        margin: 16,
                        textAlign: 'center',
                        fontWeight: "500",
                        fontSize: "15px"
                    }}>
                        Welcome Admin
                    </div>
                    <Menu
                        selectedKeys={[activeMenu]}
                        mode="inline"
                        items={items}
                        onClick={(e) => setActiveMenu(e.key)}
                    />
                </Sider>
                <Layout>
                    <div
                        className='admin-header'
                        style={{
                            height: "50px",
                            borderBottom: "1px solid #ebebeb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "0 18px",
                        }}
                    >
                        <span>
                            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                                className: 'trigger',
                                onClick: () => setCollapsed(!collapsed),
                            })}
                        </span>
                        <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                            <Space style={{ cursor: "pointer" }}>
                                <Avatar src={urlAvatar} />
                                {user?.fullName}
                            </Space>
                        </Dropdown>
                    </div>
                    <Content style={{ padding: '15px' }}>
                        <Outlet />
                    </Content>
                    <Footer style={{ padding: 0, textAlign: "center" }}>
                        Book shop &copy; Hoai Ninh - Made with <HeartTwoTone />
                    </Footer>
                </Layout>
            </Layout>

        </>
    );
};

export default AdminLayout;