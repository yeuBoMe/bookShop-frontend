import { useEffect, useState } from "react";
import { Empty, Button, Spin } from "antd";
import { ShoppingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getOrderHistoryAPI } from "@/services/api.service";
import "styles/client/order/order-history.scss";
import OrderDetailModal from "@/components/client/checkout/order-detail.modal";
import OrderHistoryTable from "@/components/client/checkout/order-his.table";

const OrderHistoryPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        try {
            setLoading(true);
            const res = await getOrderHistoryAPI();
            await new Promise((resolve) => setTimeout(resolve, 1000));
            if (res.data) setOrders(res.data.result);
        } catch (error) {
            console.error("Lỗi khi tải đơn hàng:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (order: IOrder) => {
        setSelectedOrder(order);
        setModalVisible(true);
    };

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
                <h1><ShoppingOutlined /> Lịch sử đơn hàng</h1>
                <p>Theo dõi và quản lý các đơn hàng của bạn</p>
            </div>

            <div className="order-list">
                {orders.length === 0 ? (
                    <Empty
                        image={<ShoppingOutlined style={{ fontSize: 80, color: "#ccc" }} />}
                        description={<span>Chưa có đơn hàng nào</span>}
                    >
                        <Button type="primary" onClick={() => navigate("/books")}>
                            Mua sắm ngay
                        </Button>
                    </Empty>
                ) : (
                    <OrderHistoryTable
                        orders={orders}
                        onViewDetail={handleViewDetail}
                    />
                )}
            </div>

            {/* Modal chi tiết */}
            <OrderDetailModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                selectedOrder={selectedOrder}
                setSelectedOrder={setSelectedOrder}
            />
        </div>
    );
};

export default OrderHistoryPage;
