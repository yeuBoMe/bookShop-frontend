import { EyeOutlined, DeleteOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, TruckOutlined } from "@ant-design/icons";
import { Button, Table, Tag, Space, Modal, type TableProps } from "antd";
import type { JSX } from "react";
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
}

const OrderHistoryTable = (props: OrderHistoryTableProps) => {
    const { orders, onViewDetail, meta } = props;

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
            }
        };
        return configs[status] || configs.PENDING;
    };

    // Xử lý huỷ đơn hàng
    const handleCancelOrder = (orderId: number) => {
        Modal.confirm({
            title: "Xác nhận huỷ đơn hàng",
            content: "Bạn có chắc chắn muốn huỷ đơn hàng này?",
            okText: "Xác nhận",
            cancelText: "Đóng",
            onOk: () => {
                // TODO: Gọi API để huỷ đơn hàng
                console.log("Huỷ đơn hàng:", orderId);
            }
        });
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
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            onClick={() => handleCancelOrder(record.id)}
                        >
                            Huỷ
                        </Button>
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