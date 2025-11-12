import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    TruckOutlined,
    DollarCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { Drawer, Tag, Divider, Descriptions, Badge } from "antd";
import type { JSX } from 'react';
import type { DescriptionsProps } from "antd";

interface DrawerOrderProps {
    isDrawerDetailOpen: boolean;
    setIsDrawerDetailOpen: (v: boolean) => void;
    dataDetail: IOrder | null;
    setDataDetail: (v: IOrder | null) => void;
}

const DetailOrderDrawer = (props: DrawerOrderProps) => {
    const { isDrawerDetailOpen, setIsDrawerDetailOpen, dataDetail, setDataDetail } = props;

    const handleClearDataAndCloseDrawer = () => {
        setIsDrawerDetailOpen(false);
        setDataDetail(null);
    }

    const formatCurrencyVND = (value?: number) => {
        if (!value) return "0 ₫";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    const formatDate = (dateString?: Date) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getStatusConfig = (status: string) => {
        const upperStatus = status?.toUpperCase();

        const configs: Record<string, { text: string; color: string; icon: JSX.Element }> = {
            PENDING: {
                text: "PENDING",
                color: "orange",
                icon: <ClockCircleOutlined />,
            },
            SHIPPING: {
                text: "SHIPPING",
                color: "cyan",
                icon: <TruckOutlined />,
            },
            SUCCESS: {
                text: "SUCCESS",
                color: "green",
                icon: <CheckCircleOutlined />,
            },
            CANCEL: {
                text: "CANCEL",
                color: "red",
                icon: <CloseCircleOutlined />,
            },
            PAID: {
                text: "PAID",
                color: "blue",
                icon: <DollarCircleOutlined />
            },
            UNPAID: {
                text: "UNPAID",
                color: "magenta",
                icon: <ExclamationCircleOutlined />,
            },
        };

        return configs[upperStatus] || configs.PENDING;
    };

    if (!dataDetail) {
        return null;
    }

    const statusConfig = getStatusConfig(dataDetail.status);

    // Order information
    const orderInfoItems: DescriptionsProps['items'] = [
        ...(dataDetail ? [
            {
                key: '1',
                label: 'Order ID',
                children: <strong>#{dataDetail.id}</strong>,
            },
            {
                key: '2',
                label: 'Status',
                children: (
                    <Tag color={statusConfig.color} icon={statusConfig.icon}>
                        {statusConfig.text}
                    </Tag>
                ),
            },
            {
                key: '3',
                label: 'Customer Name',
                children: <p>{dataDetail.name}</p>,
            },
            {
                key: '4',
                label: 'Phone Number',
                children: <p>{dataDetail.phone || "N/A"}</p>,
            },
            {
                key: '5',
                label: 'Shipping Address',
                children: <p>{dataDetail.address}</p>,
                span: 2,
            },
            {
                key: '6',
                label: 'Payment Method',
                children: (
                    <Badge
                        status={dataDetail.paymentMethod === "cod" ? "warning" : "success"}
                        text={dataDetail.paymentMethod === "cod"
                            ? "Cash on Delivery (COD)"
                            : dataDetail.paymentMethod === "vnpay"
                                ? "VN Pay"
                                : "Bank Transfer"}
                    />
                ),
                span: 2,
            },
            {
                key: '7',
                label: 'Order Date',
                children: <p>{formatDate(dataDetail.createdAt)}</p>,
            },
            {
                key: '8',
                label: 'Last Updated',
                children: <p>{formatDate(dataDetail.updatedAt)}</p>,
            },
        ] : [])
    ];

    // Product list
    const productsItems: DescriptionsProps['items'] = dataDetail.detail.map((item, index) => ({
        key: `product-${index}`,
        label: `Product ${index + 1}`,
        children: (
            <div>
                <p style={{ marginBottom: '8px', fontWeight: 500 }}>{item.bookName}</p>
                <div>
                    <span style={{ marginRight: '16px' }}>
                        Quantity: <strong>x{item.quantity}</strong>
                    </span>
                    <span style={{ marginRight: '16px' }}>
                        Unit Price: <strong>{formatCurrencyVND(item.price)}</strong>
                    </span>
                    <span>
                        Subtotal: <strong>{formatCurrencyVND(item.price * item.quantity)}</strong>
                    </span>
                </div>
            </div>
        ),
        span: 2,
    }));

    // Summary
    const summaryItems: DescriptionsProps['items'] = [
        {
            key: 'total',
            label: 'Total Price',
            children: <strong>{formatCurrencyVND(dataDetail.totalPrice)}</strong>,
        },
    ];

    return (
        <Drawer
            title="Order Details"
            placement="right"
            onClose={handleClearDataAndCloseDrawer}
            open={isDrawerDetailOpen}
            width={window.innerWidth > 768 ? "50vw" : "100vw"}
        >
            <Descriptions
                title="Order Information"
                items={orderInfoItems}
                bordered
                column={2}
                size="small"
            />

            <Divider />

            <div
                style={{
                    fontWeight: 600,
                    fontSize: "16px",
                    margin: "0 0 10px 0",
                    color: "#1677ff",
                }}
            >
                Ordered Products
            </div>

            <Descriptions
                items={productsItems}
                bordered
                column={2}
                size="small"
            />

            <Divider />

            <div
                style={{
                    fontWeight: 600,
                    fontSize: "16px",
                    margin: "0 0 10px 0",
                    color: "#1677ff",
                }}
            >
                Payment Summary
            </div>

            <Descriptions
                items={summaryItems}
                bordered
                size="small"
            />
        </Drawer>
    );
}

export default DetailOrderDrawer;
