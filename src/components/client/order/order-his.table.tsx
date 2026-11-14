import { updateOrderAPI } from "@/services/api.service";
import { EyeOutlined, DeleteOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, TruckOutlined, DollarCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Table, Tag, Space, type TableProps, Popconfirm, App } from "antd";
import { useTranslation } from "react-i18next";
import { useState, type JSX } from "react";
import "styles/client/order/order-his.table.scss";

interface OrderHistoryTableProps {
    orders: IOrder[];
    onViewDetail: (order: IOrder) => void;
    meta: {
        current: number;
        pageSize: number;
        pages: number;
        total: number;
    };
    fetchOrders: () => void;
}

const OrderHistoryTable = (props: OrderHistoryTableProps) => {
    const { orders, onViewDetail, meta, fetchOrders } = props;
    const { notification, message } = App.useApp();

    const { t } = useTranslation();
    const [isDeleteOrder, setIsDeleteOrder] = useState<boolean>(false);

    // Format giá tiền
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    // Format ngày tháng
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Cấu hình trạng thái
    const getStatusConfig = (status: string) => {
        const configs: Record<string, { text: string; color: string; icon: JSX.Element }> = {
            PENDING: {
                text: t("order.statusText.PENDING"),
                color: "orange",
                icon: <ClockCircleOutlined />
            },
            SHIPPING: {
                text: t("order.statusText.SHIPPING"),
                color: "cyan",
                icon: <TruckOutlined />
            },
            SUCCESS: {
                text: t("order.statusText.SUCCESS"),
                color: "green",
                icon: <CheckCircleOutlined />
            },
            CANCEL: {
                text: t("order.statusText.CANCEL"),
                color: "red",
                icon: <CloseCircleOutlined />
            },
            PAID: {
                text: t("order.statusText.PAID"),
                color: "blue",
                icon: <DollarCircleOutlined />
            },
            UNPAID: {
                text: t("order.statusText.UNPAID"),
                color: "magenta",
                icon: <ExclamationCircleOutlined />,
            },
        };
        return configs[status] || configs.PENDING;
    };

    // Xử lý huỷ đơn hàng
    const handleCancelOrder = async (orderId: number) => {
        try {
            setIsDeleteOrder(true);
            await new Promise((resolve) => setTimeout(resolve, 400));
            const updateOrderResponse = await updateOrderAPI(orderId, "CANCEL");
            if (updateOrderResponse.data) {
                message.success(t("order.cancelSuccess"));
                fetchOrders();
            }
        } catch (error: any) {
            notification.error({
                message: t("common.error"),
                description: error?.message || t("order.actionError"),
                duration: 5,
                placement: "topRight"
            });
        } finally {
            setIsDeleteOrder(false);
        }
    };

    // Định nghĩa các cột của bảng
    const columns: TableProps<IOrder>['columns'] = [
        {
            title: t("common.index"),
            key: 'stt',
            width: 60,
            align: 'center',
            render: (_, __, index) => index + 1,
        },
        {
            title: t("order.code"),
            dataIndex: 'id',
            key: 'id',
            width: 150,
            render: (id) => <strong>#{id}</strong>,
        },
        {
            title: t("order.placedAt"),
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            render: (createdAt) => formatDate(createdAt),
        },
        {
            title: t("order.products"),
            dataIndex: 'detail',
            key: 'detail',
            render: (detail: IOrderDetail[]) => (
                <div>
                    {detail.map((item) => (
                        <div key={item.id} style={{ marginBottom: 4 }}>
                            {item.bookName} <span className="order-item__qty">x{item.quantity}</span>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            title: t("order.total"),
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            width: 130,
            align: 'right',
            render: (totalPrice) => (
                <strong className="order-total">
                    {formatPrice(totalPrice)}
                </strong>
            ),
        },
        {
            title: t("order.status"),
            dataIndex: 'status',
            key: 'status',
            width: 140,
            align: 'center',
            render: (status) => {
                const config = getStatusConfig(status);
                return (
                    <Tag color={config.color} icon={config.icon}>
                        {config.text}
                    </Tag>
                );
            },
        },
        {
            title: t("order.actions"),
            key: 'action',
            width: 180,
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => onViewDetail(record)}
                    >
                        {t("order.detail")}
                    </Button>
                    {record.status === "PENDING" && (
                        <Popconfirm
                            placement='topLeft'
                            title={t("order.cancelTitle")}
                            description={t("order.cancelConfirm")}
                            okText={t("common.yes")}
                            cancelText={t("common.no")}
                            onConfirm={() => handleCancelOrder(record.id)}
                            okButtonProps={{ loading: isDeleteOrder }}
                        >
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                            >
                                {t("order.cancel")}
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <Table<IOrder>
            columns={columns}
            dataSource={orders}
            rowKey="id"
            pagination={{
                current: meta.current,
                pageSize: meta.pageSize,
                showSizeChanger: true,
                total: meta.total,
                showTotal: (total, range) => {
                    return (
                        <div>
                            {range[0]} - {range[1]} on {total} rows
                        </div>
                    )
                },
            }}
            bordered
            className="order-history-table"
        />
    );
};

export default OrderHistoryTable;