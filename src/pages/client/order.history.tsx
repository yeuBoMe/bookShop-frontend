import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Empty, Button, Spin } from "antd";
import { ShoppingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getOrderHistoryAPI } from "@/services/api.service";
import "styles/client/order/order-history.scss";
import OrderDetailModal from "@/components/client/order/order-detail.modal";
import OrderHistoryTable from "@/components/client/order/order-his.table";

const OrderHistoryPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const { t } = useTranslation();
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 5,
        pages: 0,
        total: 0
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        try {
            setLoading(true);
            const fetchOrderHistoryResponse = await getOrderHistoryAPI();
            await new Promise((resolve) => setTimeout(resolve, 1000));
            if (fetchOrderHistoryResponse.data) {
                setOrders(fetchOrderHistoryResponse.data.result);
                setMeta(fetchOrderHistoryResponse.data.meta);
            }
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
                <Spin size="large" tip={t("order.loadingHistory")} />
            </div>
        );
    }

    return (
        <div className="order-history-container">
            <div className="order-history-header">
                <h1><ShoppingOutlined /> {t("order.historyTitle")}</h1>
                <p>{t("order.historySubtitle")}</p>
            </div>

            <div className="order-list">
                {orders.length === 0 ? (
                    <Empty
                        image={<ShoppingOutlined style={{ fontSize: 80, color: "#ccc" }} />}
                        description={<span>{t("order.empty")}</span>}
                    >
                        <Button type="primary" onClick={() => navigate("/books")}>
                            {t("header.shopNow")}
                        </Button>
                    </Empty>
                ) : (
                    <OrderHistoryTable
                        orders={orders}
                        onViewDetail={handleViewDetail}
                        meta={meta}
                        fetchOrders={fetchOrders}
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
