import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Tabs,
    Card,
    Empty,
    Tag,
    Button,
    Space,
    Spin,
    Modal,
    Descriptions
} from "antd";
import {
    ShoppingOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    TruckOutlined,
    EyeOutlined,
    DeleteOutlined
} from "@ant-design/icons";
import "styles/client/order-history.scss";

// Mock data - thay bằng API call thực tế
const mockOrders = [
    {
        id: 1,
        orderNumber: "DH001234",
        status: "DELIVERED",
        totalPrice: 450000,
        createdAt: "2025-10-14T10:30:00Z",
        paymentMethod: "cod",
        address: "123 Nguyễn Văn Cừ, Quận 5, TP.HCM",
        detail: [
            { id: 1, bookName: "Clean Code", quantity: 2, price: 150000 },
            { id: 2, bookName: "Design Patterns", quantity: 1, price: 150000 }
        ]
    },
    {
        id: 2,
        orderNumber: "DH001235",
        status: "SHIPPING",
        totalPrice: 280000,
        createdAt: "2025-10-13T14:20:00Z",
        paymentMethod: "banking",
        address: "456 Lê Lợi, Quận 1, TP.HCM",
        detail: [
            { id: 3, bookName: "Head First Java", quantity: 1, price: 250000 }
        ]
    },
    {
        id: 3,
        orderNumber: "DH001236",
        status: "PENDING",
        totalPrice: 520000,
        createdAt: "2025-10-12T09:15:00Z",
        paymentMethod: "cod",
        address: "789 Trần Hưng Đạo, Quận 1, TP.HCM",
        detail: [
            { id: 4, bookName: "JavaScript: The Good Parts", quantity: 1, price: 180000 },
            { id: 5, bookName: "You Don't Know JS", quantity: 2, price: 170000 }
        ]
    },
    {
        id: 4,
        orderNumber: "DH001237",
        status: "CANCELLED",
        totalPrice: 195000,
        createdAt: "2025-10-11T16:45:00Z",
        paymentMethod: "cod",
        address: "321 Võ Văn Tần, Quận 3, TP.HCM",
        detail: [
            { id: 6, bookName: "React Hooks in Action", quantity: 1, price: 195000 }
        ]
    }
];

const OrderHistoryPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState("ALL");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            // Giả lập API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setOrders(mockOrders);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getStatusConfig = (status) => {
        const configs = {
            PENDING: {
                text: "Chờ xác nhận",
                color: "orange",
                icon: <ClockCircleOutlined />
            },
            CONFIRMED: {
                text: "Đã xác nhận",
                color: "blue",
                icon: <CheckCircleOutlined />
            },
            SHIPPING: {
                text: "Đang giao",
                color: "cyan",
                icon: <TruckOutlined />
            },
            DELIVERED: {
                text: "Đã giao",
                color: "green",
                icon: <CheckCircleOutlined />
            },
            CANCELLED: {
                text: "Đã huỷ",
                color: "red",
                icon: <CloseCircleOutlined />
            }
        };
        return configs[status] || configs.PENDING;
    };

    const filterOrders = (status) => {
        if (status === "ALL") return orders;
        return orders.filter(order => order.status === status);
    };

    const handleViewDetail = (order) => {
        setSelectedOrder(order);
        setModalVisible(true);
    };

    const handleCancelOrder = (orderId) => {
        Modal.confirm({
            title: "Xác nhận huỷ đơn hàng",
            content: "Bạn có chắc chắn muốn huỷ đơn hàng này?",
            okText: "Xác nhận",
            cancelText: "Đóng",
            onOk: () => {
                // API call để huỷ đơn hàng
                console.log("Cancel order:", orderId);
            }
        });
    };

    const OrderCard = ({ order }) => {
        const statusConfig = getStatusConfig(order.status);

        return (
            <Card className="order-card" hoverable>
                <div className="order-header">
                    <div className="order-number">
                        <ShoppingOutlined />
                        <span>Mã đơn: <strong>{order.orderNumber}</strong></span>
                    </div>
                    <Tag
                        color={statusConfig.color}
                        icon={statusConfig.icon}
                        className="order-status"
                    >
                        {statusConfig.text}
                    </Tag>
                </div>

                <div className="order-body">
                    <div className="order-items">
                        {order.detail.map((item, index) => (
                            <div key={index} className="order-item">
                                <div className="item-info">
                                    <span className="item-name">{item.bookName}</span>
                                    <span className="item-quantity">x{item.quantity}</span>
                                </div>
                                <span className="item-price">
                                    {formatPrice(item.price * item.quantity)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="order-divider"></div>

                    <div className="order-info">
                        <div className="info-row">
                            <span className="info-label">Thời gian đặt:</span>
                            <span className="info-value">{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Thanh toán:</span>
                            <span className="info-value">
                                {order.paymentMethod === "cod" ? "COD" : "Chuyển khoản"}
                            </span>
                        </div>
                        <div className="info-row total">
                            <span className="info-label">Tổng tiền:</span>
                            <span className="info-value price">
                                {formatPrice(order.totalPrice)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="order-footer">
                    <Space>
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetail(order)}
                        >
                            Xem chi tiết
                        </Button>
                        {order.status === "PENDING" && (
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleCancelOrder(order.id)}
                            >
                                Huỷ đơn
                            </Button>
                        )}
                        {order.status === "DELIVERED" && (
                            <Button type="primary">
                                Mua lại
                            </Button>
                        )}
                    </Space>
                </div>
            </Card>
        );
    };

    const tabItems = [
        { key: "ALL", label: "Tất cả", count: orders.length },
        { key: "PENDING", label: "Chờ xác nhận", count: filterOrders("PENDING").length },
        { key: "CONFIRMED", label: "Đã xác nhận", count: filterOrders("CONFIRMED").length },
        { key: "SHIPPING", label: "Đang giao", count: filterOrders("SHIPPING").length },
        { key: "DELIVERED", label: "Đã giao", count: filterOrders("DELIVERED").length },
        { key: "CANCELLED", label: "Đã huỷ", count: filterOrders("CANCELLED").length }
    ];

    const filteredOrders = filterOrders(activeTab);

    if (loading) {
        return (
            <div className="order-history-loading">
                <Spin size="large" tip="Đang tải lịch sử đơn hàng..." />
            </div>
        );
    }

    return (
        <div className="order-history-container">
            <div className="order-history-header">
                <h1>
                    <ShoppingOutlined /> Lịch sử đơn hàng
                </h1>
                <p>Quản lý và theo dõi đơn hàng của bạn</p>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className="order-tabs"
                items={tabItems.map(item => ({
                    key: item.key,
                    label: (
                        <span>
                            {item.label}
                            {item.count > 0 && (
                                <span className="tab-count">({item.count})</span>
                            )}
                        </span>
                    )
                }))}
            />

            <div className="order-list">
                {filteredOrders.length === 0 ? (
                    <Empty
                        image={<ShoppingOutlined style={{ fontSize: 80, color: "#ccc" }} />}
                        description={
                            <div>
                                <h3>Chưa có đơn hàng nào</h3>
                                <p>Hãy khám phá và đặt hàng ngay!</p>
                            </div>
                        }
                    >
                        <Button
                            type="primary"
                            size="large"
                            onClick={() => navigate("/books")}
                        >
                            Mua sắm ngay
                        </Button>
                    </Empty>
                ) : (
                    filteredOrders.map(order => (
                        <OrderCard key={order.id} order={order} />
                    ))
                )}
            </div>

            {/* Modal chi tiết đơn hàng */}
            <Modal
                title={
                    <div className="modal-title">
                        <ShoppingOutlined />
                        <span>Chi tiết đơn hàng</span>
                    </div>
                }
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={700}
                className="order-detail-modal"
            >
                {selectedOrder && (
                    <div className="order-detail-content">
                        <Descriptions column={1} bordered>
                            <Descriptions.Item label="Mã đơn hàng">
                                <strong>{selectedOrder.orderNumber}</strong>
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag
                                    color={getStatusConfig(selectedOrder.status).color}
                                    icon={getStatusConfig(selectedOrder.status).icon}
                                >
                                    {getStatusConfig(selectedOrder.status).text}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian đặt">
                                {formatDate(selectedOrder.createdAt)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ giao hàng">
                                {selectedOrder.address}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thanh toán">
                                {selectedOrder.paymentMethod === "cod"
                                    ? "Thanh toán khi nhận hàng (COD)"
                                    : "Chuyển khoản ngân hàng"}
                            </Descriptions.Item>
                        </Descriptions>

                        <div className="modal-products">
                            <h3>Sản phẩm đã đặt</h3>
                            {selectedOrder.detail.map((item, index) => (
                                <div key={index} className="modal-product-item">
                                    <div className="product-info">
                                        <span className="product-name">{item.bookName}</span>
                                        <span className="product-quantity">x{item.quantity}</span>
                                    </div>
                                    <span className="product-price">
                                        {formatPrice(item.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="modal-total">
                            <span>Tổng tiền:</span>
                            <span className="total-price">
                                {formatPrice(selectedOrder.totalPrice)}
                            </span>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default OrderHistoryPage;