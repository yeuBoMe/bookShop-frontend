import { updateOrderAPI } from "@/services/api.service";
import { EyeOutlined, DeleteOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, TruckOutlined, DollarCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Table, Tag, Space, type TableProps, Popconfirm, App } from "antd";
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
                text: "Chờ xác nhận",
                color: "orange",
                icon: <ClockCircleOutlined />
            },
            SHIPPING: {
                text: "Đang giao",
                color: "cyan",
                icon: <TruckOutlined />
            },
            SUCCESS: {
                text: "Thành công",
                color: "green",
                icon: <CheckCircleOutlined />
            },
            CANCEL: {
                text: "Đã huỷ",
                color: "red",
                icon: <CloseCircleOutlined />
            },
            PAID: {
                text: "Đã thanh toán",
                color: "blue",
                icon: <DollarCircleOutlined />
            },
            UNPAID: {
                text: "UNPAID",
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
                message.success("Hủy đơn hàng thành công!");
                fetchOrders();
            }
        } catch (error: any) {
            notification.error({
                message: "Error",
                description: error?.message || "Có lỗi xảy ra khi thao tác đơn hàng",
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
            title: 'STT',
            key: 'stt',
            width: 60,
            align: 'center',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Mã đơn hàng',
            dataIndex: 'id',
            key: 'id',
            width: 150,
            render: (id) => <strong>#{id}</strong>,
        },
        {
            title: 'Thời gian đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            render: (createdAt) => formatDate(createdAt),
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'detail',
            key: 'detail',
            render: (detail: IOrderDetail[]) => (
                <div>
                    {detail.map((item, index) => (
                        <div key={index} style={{ marginBottom: 4 }}>
                            {item.bookName} <span style={{ color: '#999' }}>x{item.quantity}</span>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            width: 130,
            align: 'right',
            render: (totalPrice) => (
                <strong style={{ color: '#ff4d4f', fontSize: 15 }}>
                    {formatPrice(totalPrice)}
                </strong>
            ),
        },
        {
            title: 'Trạng thái',
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
            title: 'Thao tác',
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
                        Chi tiết
                    </Button>
                    {record.status === "PENDING" && (
                        <Popconfirm
                            placement='topLeft'
                            title="Hủy đơn hàng"
                            description="Bạn có chắc muốn hủy đơn hàng này?"
                            okText="OK"
                            cancelText="Không"
                            onConfirm={() => handleCancelOrder(record.id)}
                            okButtonProps={{ loading: isDeleteOrder }}
                        >
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                            >
                                Huỷ
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