import { ShoppingOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, TruckOutlined, DollarCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { Button, Descriptions, Modal, Tag } from 'antd'
import { useTranslation } from "react-i18next";
import type { JSX } from 'react';
import "styles/client/order/order-detail.scss";

interface OrderDetailModalProps {
    modalVisible: boolean;
    setModalVisible: (v: boolean) => void;
    selectedOrder: IOrder | null;
    setSelectedOrder: (v: IOrder | null) => void;
}

const OrderDetailModal = (props: OrderDetailModalProps) => {
    const { t } = useTranslation();
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
                    <span>{t("order.detailTitle", { id: selectedOrder.id })}</span>
                </div>
            }
            open={modalVisible}
            closable={false}
            footer={[
                <Button key="close" onClick={handleCloseModal}>
                    {t("common.close")}
                </Button>
            ]}
            width={700}
            maskClosable={false}
            className="order-detail-modal"
        >
            <div className="order-detail-content">
                {/* Thông tin chung của đơn hàng */}
                <Descriptions column={1} bordered>
                    <Descriptions.Item label={t("order.code")}>
                        <strong>{selectedOrder.id}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label={t("order.status")}>
                        <Tag color={statusConfig.color} icon={statusConfig.icon}>
                            {statusConfig.text}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label={t("order.placedAt")}>
                        {formatDate(selectedOrder.createdAt)}
                    </Descriptions.Item>
                    <Descriptions.Item label={t("order.address")}>
                        {selectedOrder.address}
                    </Descriptions.Item>
                    <Descriptions.Item label={t("order.paymentMethod")}>
                        {selectedOrder.paymentMethod === "cod"
                            ? t("order.payment.COD")
                            : selectedOrder.paymentMethod === "vnpay"
                                ? t("order.payment.VNPAY")
                                : t("order.payment.MOMO")}
                    </Descriptions.Item>
                </Descriptions>

                {/* Danh sách sản phẩm trong đơn hàng */}
                <div className="modal-products">
                    <h3>{t("order.orderedProducts")}</h3>
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
                    <span>{t("order.totalLabel")}</span>
                    <span className="total-price">
                        {formatPrice(selectedOrder.totalPrice)}
                    </span>
                </div>
            </div>
        </Modal >
    )
}

export default OrderDetailModal;
