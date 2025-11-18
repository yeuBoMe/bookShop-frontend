import { ShoppingOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, TruckOutlined, DollarCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { Button, Descriptions, Modal, Tag } from 'antd'
import type { JSX } from 'react';
import "styles/client/order/order-detail.scss";

interface OrderDetailModalProps {
    modalVisible: boolean;
    setModalVisible: (v: boolean) => void;
    selectedOrder: IOrder | null;
    setSelectedOrder: (v: IOrder | null) => void;
}

const OrderDetailModal = (props: OrderDetailModalProps) => {
    const { modalVisible, setModalVisible, selectedOrder, setSelectedOrder } = props;

    // Format giá tiền
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    // Format ngày tháng
    const formatDate = (dateString?: Date) => {
        if (!dateString) return "N/A";
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

    // Nếu không có đơn hàng được chọn thì không hiển thị gì
    if (!selectedOrder) {
        return null;
    }

    const statusConfig = getStatusConfig(selectedOrder.status);

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedOrder(null);
    }

    return (
        <Modal
            title={
                <div className="modal-title">
                    <ShoppingOutlined />
                    <span>Chi tiết đơn hàng #{selectedOrder.id}</span>
                </div>
            }
            open={modalVisible}
            closable={false}
            footer={[
                <Button key="close" onClick={handleCloseModal}>
                    Đóng
                </Button>
            ]}
            width={700}
            maskClosable={false}
            className="order-detail-modal"
        >
            <div className="order-detail-content">
                {/* Thông tin chung của đơn hàng */}
                <Descriptions column={1} bordered>
                    <Descriptions.Item label="Mã đơn hàng">
                        <strong>{selectedOrder.id}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Tag color={statusConfig.color} icon={statusConfig.icon}>
                            {statusConfig.text}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian đặt">
                        {formatDate(selectedOrder.createdAt)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ giao hàng">
                        {selectedOrder.address}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phương thức thanh toán">
                        {selectedOrder.paymentMethod === "cod"
                            ? "Thanh toán khi nhận hàng (COD)"
                            : selectedOrder.paymentMethod === "vnpay"
                                ? "Thanh toán bằng ví VNPay"
                                : "Thanh toán MoMo QR"}
                    </Descriptions.Item>
                </Descriptions>

                {/* Danh sách sản phẩm trong đơn hàng */}
                <div className="modal-products">
                    <h3>Sản phẩm đã đặt</h3>
                    {selectedOrder.detail.map((item, index) => {
                        console.log("Check data detail >>>", item);
                        return (
                            <div key={index} className="modal-product-item" >
                                <div className="product-info">
                                    <span className="product-name">{item.bookName}</span>
                                    <span className="product-quantity">x{item.quantity}</span>
                                </div>
                                <div className="product-price">
                                    {formatPrice(item.price * item.quantity)}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Tổng tiền */}
                <div className="modal-total">
                    <span>Tổng tiền:</span>
                    <span className="total-price">
                        {formatPrice(selectedOrder.totalPrice)}
                    </span>
                </div>
            </div>
        </Modal >
    )
}

export default OrderDetailModal;
