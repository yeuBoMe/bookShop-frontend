import { getDashBoardInfoAPI, getDashboardStatisticsAPI } from '@/services/api.service';
import {
    ShoppingOutlined,
    BookOutlined,
    TeamOutlined,
    StarOutlined,
    AppstoreOutlined,
    ArrowRightOutlined,
    DollarOutlined,
    ShoppingCartOutlined,
    LineChartOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import CountUp from 'react-countup';
import { Link } from 'react-router-dom';
import { DatePicker, Empty, Spin, Table, Tag, notification } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import RevenueChart from '@/components/admin/dashboard/revenue.chart';
import CategoryRevenuePie from '@/components/admin/dashboard/category.revenue.pie';
import 'styles/admin/dashboard.scss';

const { RangePicker } = DatePicker;

type StatCard = {
    key: string;
    /** Key trong bản dịch, dịch lúc render để đổi ngay khi người dùng đổi ngôn ngữ. */
    labelKey: string;
    to: string;
    icon: ReactNode;
    /** Màu nhấn — biến CSS khai báo ở global.scss, có bản riêng cho chế độ tối. */
    accent: string;
    accentSoft: string;
    pick: (data: IDashBoard | null) => number;
};

/**
 * Năm màu trải đều vòng thuần sắc (lục → lam → tím → hổ phách → hồng) nên vẫn
 * phân biệt được với người mù màu đỏ–lục. Ngoài ra mỗi thẻ còn có icon và nhãn
 * chữ riêng: màu chỉ là lớp thông tin phụ, không phải lớp duy nhất.
 */
const CARDS: StatCard[] = [
    {
        key: 'orders',
        labelKey: 'admin.dashboard.orders',
        to: '/admin/order',
        icon: <ShoppingOutlined />,
        accent: 'var(--accent-emerald)',
        accentSoft: 'var(--accent-emerald-soft)',
        pick: (d) => d?.countOrders ?? 0,
    },
    {
        key: 'books',
        labelKey: 'admin.dashboard.books',
        to: '/admin/book',
        icon: <BookOutlined />,
        accent: 'var(--accent-blue)',
        accentSoft: 'var(--accent-blue-soft)',
        pick: (d) => d?.countBooks ?? 0,
    },
    {
        key: 'users',
        labelKey: 'admin.dashboard.users',
        to: '/admin/user',
        icon: <TeamOutlined />,
        accent: 'var(--accent-violet)',
        accentSoft: 'var(--accent-violet-soft)',
        pick: (d) => d?.countUsers ?? 0,
    },
    {
        key: 'categories',
        labelKey: 'admin.dashboard.categories',
        to: '/admin/category',
        icon: <AppstoreOutlined />,
        accent: 'var(--accent-amber)',
        accentSoft: 'var(--accent-amber-soft)',
        pick: (d) => d?.countCategories ?? 0,
    },
    {
        key: 'ratings',
        labelKey: 'admin.dashboard.ratings',
        to: '/admin/rating',
        icon: <StarOutlined />,
        accent: 'var(--accent-rose)',
        accentSoft: 'var(--accent-rose-soft)',
        pick: (d) => d?.countRatings ?? 0,
    },
];

/** Màu trạng thái đơn — trùng bảng màu đang dùng ở màn quản lý đơn hàng. */
const STATUS_COLORS: Record<string, string> = {
    SUCCESS: 'green',
    PAID: 'cyan',
    SHIPPING: 'blue',
    PENDING: 'gold',
    UNPAID: 'orange',
    CANCEL: 'red',
};

// Người bật "giảm chuyển động" trong hệ điều hành thì hiện thẳng con số,
// không chạy hiệu ứng đếm.
const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const formatCurrency = (value: number) => `${Math.round(value).toLocaleString('vi-VN')} đ`;

const DashBoardPage = () => {
    const [dashboardData, setDashboardData] = useState<IDashBoard | null>(null);
    const [statistics, setStatistics] = useState<IDashboardStatistics | null>(null);
    const [isLoadingStatistics, setIsLoadingStatistics] = useState(false);
    const [range, setRange] = useState<[Dayjs, Dayjs]>([dayjs().subtract(30, 'day'), dayjs()]);
    const { t } = useTranslation();

    const fetchDashboardData = useCallback(async () => {
        try {
            const getDashBoardInfoResponse = await getDashBoardInfoAPI();
            if (getDashBoardInfoResponse && getDashBoardInfoResponse.data) {
                setDashboardData(getDashBoardInfoResponse.data);
            }
        } catch (error: any) {
            notification.error({
                message: t('admin.dashboard.loadFail'),
                description: error?.message ?? t('book.tryAgainLater'),
                placement: 'topRight',
            });
        }
    }, [t]);

    const fetchStatistics = useCallback(async () => {
        try {
            setIsLoadingStatistics(true);
            const response = await getDashboardStatisticsAPI(
                range[0].startOf('day').toISOString(),
                range[1].endOf('day').toISOString()
            );
            if (response && response.data) {
                setStatistics(response.data);
            }
        } catch (error: any) {
            notification.error({
                message: t('admin.dashboard.loadStatisticsFail'),
                description: error?.message ?? t('book.tryAgainLater'),
                placement: 'topRight',
            });
        } finally {
            setIsLoadingStatistics(false);
        }
    }, [range, t]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    useEffect(() => {
        fetchStatistics();
    }, [fetchStatistics]);

    const topBookColumns: ColumnsType<ITopBook> = [
        {
            title: '#',
            key: 'index',
            width: 48,
            render: (_value, _record, index) => index + 1,
        },
        {
            title: t('field.name'),
            dataIndex: 'name',
            key: 'name',
            render: (value: string, record) => (
                <Link to={`/admin/book?name=${encodeURIComponent(record.name)}`}>{value}</Link>
            ),
        },
        { title: t('field.author'), dataIndex: 'author', key: 'author' },
        {
            title: t('admin.dashboard.soldQuantity'),
            dataIndex: 'soldQuantity',
            key: 'soldQuantity',
            align: 'right',
        },
        {
            title: t('admin.dashboard.revenue'),
            dataIndex: 'revenue',
            key: 'revenue',
            align: 'right',
            render: (value: number) => formatCurrency(value),
        },
    ];

    const topCustomerColumns: ColumnsType<ITopCustomer> = [
        {
            title: '#',
            key: 'index',
            width: 48,
            render: (_value, _record, index) => index + 1,
        },
        { title: t('field.fullName'), dataIndex: 'name', key: 'name' },
        { title: t('field.email'), dataIndex: 'email', key: 'email' },
        {
            title: t('admin.dashboard.orderCount'),
            dataIndex: 'orderCount',
            key: 'orderCount',
            align: 'right',
        },
        {
            title: t('admin.dashboard.totalSpent'),
            dataIndex: 'totalSpent',
            key: 'totalSpent',
            align: 'right',
            render: (value: number) => formatCurrency(value),
        },
    ];

    const lowStockColumns: ColumnsType<ILowStockBook> = [
        { title: t('field.name'), dataIndex: 'name', key: 'name' },
        { title: t('field.author'), dataIndex: 'author', key: 'author' },
        {
            title: t('field.quantity'),
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'right',
            render: (value: number) => (
                <Tag color={value === 0 ? 'red' : 'orange'}>{value}</Tag>
            ),
        },
    ];

    return (
        <div className="admin-dashboard">
            <div className="admin-dashboard__head">
                <h1>{t('admin.dashboard.title')}</h1>
                <p>{t('admin.dashboard.subtitle')}</p>
            </div>

            <div className="admin-dashboard__grid">
                {CARDS.map((card) => (
                    <Link
                        key={card.key}
                        to={card.to}
                        className="stat-card"
                        style={{
                            '--accent': card.accent,
                            '--accent-soft': card.accentSoft,
                        } as CSSProperties}
                    >
                        <div className="stat-card__top">
                            <span className="stat-card__icon" aria-hidden="true">
                                {card.icon}
                            </span>
                            <span className="stat-card__label">{t(card.labelKey)}</span>
                        </div>

                        <strong className="stat-card__value">
                            <CountUp
                                end={card.pick(dashboardData)}
                                separator="."
                                duration={prefersReducedMotion() ? 0 : 1.2}
                                preserveValue
                            />
                        </strong>

                        <span className="stat-card__more">
                            {t('common.viewDetail')}
                            <ArrowRightOutlined className="arrow" aria-hidden="true" />
                        </span>
                    </Link>
                ))}
            </div>

            <div className="admin-dashboard__toolbar">
                <h2>
                    <LineChartOutlined aria-hidden="true" /> {t('admin.dashboard.businessOverview')}
                </h2>
                <RangePicker
                    value={range}
                    allowClear={false}
                    // Chọn ngày tương lai không có dữ liệu nên chặn luôn cho khỏi hiểu nhầm là lỗi
                    disabledDate={(current) => current && current > dayjs().endOf('day')}
                    onChange={(values) => {
                        if (values && values[0] && values[1]) {
                            setRange([values[0], values[1]]);
                        }
                    }}
                />
            </div>

            <Spin spinning={isLoadingStatistics}>
                <div className="admin-dashboard__revenue">
                    <div className="revenue-card revenue-card--primary">
                        <span className="revenue-card__icon" aria-hidden="true">
                            <DollarOutlined />
                        </span>
                        <span className="revenue-card__label">{t('admin.dashboard.totalRevenue')}</span>
                        <strong className="revenue-card__value">
                            {formatCurrency(statistics?.revenue.totalRevenue ?? 0)}
                        </strong>
                        <span className="revenue-card__hint">{t('admin.dashboard.paidOnly')}</span>
                    </div>

                    <div className="revenue-card">
                        <span className="revenue-card__icon" aria-hidden="true">
                            <ShoppingCartOutlined />
                        </span>
                        <span className="revenue-card__label">{t('admin.dashboard.paidOrders')}</span>
                        <strong className="revenue-card__value">
                            {statistics?.revenue.paidOrderCount ?? 0}
                        </strong>
                    </div>

                    <div className="revenue-card">
                        <span className="revenue-card__icon" aria-hidden="true">
                            <LineChartOutlined />
                        </span>
                        <span className="revenue-card__label">{t('admin.dashboard.averageOrderValue')}</span>
                        <strong className="revenue-card__value">
                            {formatCurrency(statistics?.revenue.averageOrderValue ?? 0)}
                        </strong>
                    </div>
                </div>

                <section className="admin-dashboard__panel">
                    <h3>{t('admin.dashboard.revenueByDay')}</h3>
                    <RevenueChart points={statistics?.revenueByDay ?? []} />
                </section>

                <section className="admin-dashboard__panel">
                    <h3>{t('admin.dashboard.revenueByCategory')}</h3>
                    <CategoryRevenuePie shares={statistics?.revenueByCategory ?? []} />
                </section>

                <section className="admin-dashboard__panel">
                    <h3>{t('admin.dashboard.ordersByStatus')}</h3>
                    {statistics && statistics.ordersByStatus.length > 0 ? (
                        <div className="status-breakdown">
                            {statistics.ordersByStatus.map((item) => (
                                <div key={item.status} className="status-breakdown__item">
                                    <Tag color={STATUS_COLORS[item.status] ?? 'default'}>
                                        {t(`admin.order.status.${item.status}`, item.status)}
                                    </Tag>
                                    <strong>{item.orderCount}</strong>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Empty description={t('admin.dashboard.noData')} />
                    )}
                </section>

                <div className="admin-dashboard__panels">
                    <section className="admin-dashboard__panel">
                        <h3>{t('admin.dashboard.topSellingBooks')}</h3>
                        <Table
                            rowKey="bookId"
                            size="small"
                            pagination={false}
                            columns={topBookColumns}
                            dataSource={statistics?.topSellingBooks ?? []}
                            locale={{ emptyText: <Empty description={t('admin.dashboard.noData')} /> }}
                        />
                    </section>

                    <section className="admin-dashboard__panel">
                        <h3>{t('admin.dashboard.topCustomers')}</h3>
                        <Table
                            rowKey="email"
                            size="small"
                            pagination={false}
                            columns={topCustomerColumns}
                            dataSource={statistics?.topCustomers ?? []}
                            locale={{ emptyText: <Empty description={t('admin.dashboard.noData')} /> }}
                        />
                    </section>
                </div>

                <section className="admin-dashboard__panel admin-dashboard__panel--warning">
                    <h3>
                        <WarningOutlined aria-hidden="true" /> {t('admin.dashboard.lowStock')}
                    </h3>
                    <Table
                        rowKey="bookId"
                        size="small"
                        pagination={false}
                        columns={lowStockColumns}
                        dataSource={statistics?.lowStockBooks ?? []}
                        locale={{ emptyText: <Empty description={t('admin.dashboard.lowStockEmpty')} /> }}
                    />
                </section>
            </Spin>
        </div>
    );
};

export default DashBoardPage;