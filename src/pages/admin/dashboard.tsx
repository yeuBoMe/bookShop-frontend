import { getDashBoardInfoAPI } from '@/services/api.service';
import {
    ShoppingOutlined,
    BookOutlined,
    UserOutlined,
    RiseOutlined,
    AppstoreOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Statistic } from 'antd';
import { useEffect, useState } from 'react';
import CountUp from 'react-countup';
import { Link } from 'react-router-dom';

const DashBoardPage = () => {
    const [dashboardData, setDashboardData] = useState<IDashBoard | null>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const getDashBoardInfoResponse = await getDashBoardInfoAPI();
            if (getDashBoardInfoResponse && getDashBoardInfoResponse.data) {
                setDashboardData(getDashBoardInfoResponse.data);
            }
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
        }
    };

    const formatter = (value: number) => (
        <CountUp end={value} separator="," duration={1.5} />
    );

    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>
                    Dashboard
                </h1>
                <p style={{ color: '#8c8c8c', fontSize: '14px' }}>
                    System Overview Statistics
                </p>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]}>
                {/* Orders Card */}
                <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                    <Card hoverable>
                        <Link to={"/admin/order"}>
                            <Statistic
                                title={
                                    <span style={{ fontSize: '16px', fontWeight: 500 }}>
                                        Total Orders
                                    </span>
                                }
                                value={dashboardData?.countOrders || 0}
                                prefix={<ShoppingOutlined style={{ color: '#1890ff' }} />}
                                formatter={(value) => formatter(value as number)}
                                valueStyle={{
                                    color: '#1890ff',
                                    fontSize: '32px',
                                    fontWeight: 700
                                }}
                            />
                            <div style={{
                                marginTop: '16px',
                                paddingTop: '16px',
                                borderTop: '1px solid #f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <RiseOutlined style={{ color: '#52c41a' }} />
                                <span style={{ color: '#52c41a', fontSize: '14px' }}>
                                    +12% from last month
                                </span>
                            </div>
                        </Link>
                    </Card>
                </Col>

                {/* Books Card */}
                <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                    <Card hoverable>
                        <Link to={"/admin/book"}>
                            <Statistic
                                title={
                                    <span style={{ fontSize: '16px', fontWeight: 500 }}>
                                        Total Books
                                    </span>
                                }
                                value={dashboardData?.countBooks || 0}
                                prefix={<BookOutlined style={{ color: '#52c41a' }} />}
                                formatter={(value) => formatter(value as number)}
                                valueStyle={{
                                    color: '#52c41a',
                                    fontSize: '32px',
                                    fontWeight: 700
                                }}
                            />
                            <div style={{
                                marginTop: '16px',
                                paddingTop: '16px',
                                borderTop: '1px solid #f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <RiseOutlined style={{ color: '#52c41a' }} />
                                <span style={{ color: '#52c41a', fontSize: '14px' }}>
                                    +8% from last month
                                </span>
                            </div>
                        </Link>
                    </Card>
                </Col>

                {/* Users Card */}
                <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                    <Card hoverable>
                        <Link to={"/admin/user"}>
                            <Statistic
                                title={
                                    <span style={{ fontSize: '16px', fontWeight: 500 }}>
                                        Total Users
                                    </span>
                                }
                                value={dashboardData?.countUsers || 0}
                                prefix={<UserOutlined style={{ color: '#faad14' }} />}
                                formatter={(value) => formatter(value as number)}
                                valueStyle={{
                                    color: '#faad14',
                                    fontSize: '32px',
                                    fontWeight: 700
                                }}
                            />
                            <div style={{
                                marginTop: '16px',
                                paddingTop: '16px',
                                borderTop: '1px solid #f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <RiseOutlined style={{ color: '#52c41a' }} />
                                <span style={{ color: '#52c41a', fontSize: '14px' }}>
                                    +15% from last month
                                </span>
                            </div>
                        </Link>
                    </Card>
                </Col>

                {/* Categories Card */}
                <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                    <Card hoverable>
                        <Link to={"/admin/category"}>
                            <Statistic
                                title={
                                    <span style={{ fontSize: '16px', fontWeight: 500 }}>
                                        Total Categories
                                    </span>
                                }
                                value={dashboardData?.countCategories || 0}
                                prefix={<AppstoreOutlined style={{ color: '#722ed1' }} />}
                                formatter={(value) => formatter(value as number)}
                                valueStyle={{
                                    color: '#722ed1',
                                    fontSize: '32px',
                                    fontWeight: 700
                                }}
                            />
                            <div style={{
                                marginTop: '16px',
                                paddingTop: '16px',
                                borderTop: '1px solid #f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <RiseOutlined style={{ color: '#52c41a' }} />
                                <span style={{ color: '#52c41a', fontSize: '14px' }}>
                                    +5% from last month
                                </span>
                            </div>
                        </Link>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashBoardPage;