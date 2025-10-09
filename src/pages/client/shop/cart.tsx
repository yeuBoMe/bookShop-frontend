import { useNavigate } from "react-router-dom";
import { App, Button, InputNumber, Empty, Popconfirm } from "antd";
import {
    DeleteOutlined,
    ShoppingCartOutlined,
    MinusOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { useCurrentApp } from "@/components/context/app.context";
import "styles/client/cart.scss";
import { useEffect, useState } from "react";

const CartPage = () => {
    const navigate = useNavigate();
    const { carts, setCarts } = useCurrentApp();
    const { message } = App.useApp();
    const baseUrl = `${import.meta.env.VITE_BACKEND_URL}`;
    const [totalPrice, setTotalPrice] = useState<number>(0);

    useEffect(() => {
        if (carts && carts.length > 0) {
            let sum = 0;
            carts.map((item) => {
                sum += item.detail.price * item.quantity;
            });
            setTotalPrice(sum);
        } else {
            setTotalPrice(0);
        }
    }, [carts])

    // Tính tổng tiền (few carts)
    // const calculateTotal = () => {
    //     if (!carts || carts.length === 0) return 0;
    //     return carts.reduce((total, item) => {
    //         return total + item.detail.price * item.quantity;
    //     }, 0); // 0: giá trị khởi tạo
    // };

    // Cập nhật số lượng
    const handleUpdateQuantity = (bookId: number, newQuantity: number) => {
        if (!carts) return;

        const updatedCarts = carts.map((item) => {
            if (item.id === bookId) {
                // Kiểm tra số lượng tối đa
                if (newQuantity > item.detail.quantity) {
                    message.warning(`Chỉ còn ${item.detail.quantity} sản phẩm`);
                    return { ...item, quantity: item.detail.quantity };
                }
                return { ...item, quantity: newQuantity };
            }
            return item;
        });

        setCarts(updatedCarts);
        localStorage.setItem("carts", JSON.stringify(updatedCarts));
    };

    // Xóa một sản phẩm
    const handleRemoveItem = (bookId: number) => {
        if (!carts) return;

        const updatedCarts = carts.filter((item) => item.id !== bookId);
        setCarts(updatedCarts);
        localStorage.setItem("carts", JSON.stringify(updatedCarts));
        message.success("Đã xóa sản phẩm khỏi giỏ hàng");
    };

    // Xóa tất cả
    const handleClearCart = () => {
        setCarts([]);
        localStorage.removeItem("carts");
        message.success("Đã xóa tất cả sản phẩm");
    };

    // Mua hàng
    const handleCheckout = () => {
        message.info("Chức năng thanh toán đang được phát triển");
        // navigate("/checkout");
    };

    // Format giá tiền
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    if (!carts || carts.length === 0) {
        return (
            <div className="cart-page-container">
                <div className="cart-empty">
                    <Empty
                        image={<ShoppingCartOutlined style={{ fontSize: 80, color: "#ccc" }} />}
                        description={
                            <div className="empty-text">
                                <h3>Giỏ hàng của bạn đang trống</h3>
                                <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
                            </div>
                        }
                    >
                        <Button type="primary" size="large" onClick={() => navigate("/books")}>
                            Khám phá sản phẩm
                        </Button>
                    </Empty>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page-container">
            <div className="cart-header">
                <h1>
                    <ShoppingCartOutlined /> Giỏ hàng của bạn
                </h1>
                <p className="cart-count">({carts.length} sản phẩm)</p>
            </div>

            <div className="cart-content">
                {/* Danh sách sản phẩm */}
                <div className="cart-items-section">
                    <div className="cart-items-header">
                        <span className="header-product">Sản phẩm</span>
                        <span className="header-price">Đơn giá</span>
                        <span className="header-quantity">Số lượng</span>
                        <span className="header-total">Thành tiền</span>
                        <span className="header-action">Thao tác</span>
                    </div>

                    <div className="cart-items-list">
                        {carts.map((item) => (
                            <div key={item.id} className="cart-item">
                                <div className="item-product">
                                    <img
                                        src={
                                            item.detail.images && item.detail.images.length > 0
                                                ? `${baseUrl}/upload/book/${item.detail.images[0]}`
                                                : "https://via.placeholder.com/100x130?text=No+Image"
                                        }
                                        alt={item.detail.name}
                                    />
                                    <div className="item-info">
                                        <h3
                                            className="item-name"
                                            onClick={() => navigate(`/books/${item.id}`)}
                                        >
                                            {item.detail.name}
                                        </h3>
                                        <p className="item-category">{item.detail.category}</p>
                                        <p className="item-stock">
                                            Còn lại: {item.detail.quantity} sản phẩm
                                        </p>
                                    </div>
                                </div>

                                <div className="item-price">
                                    {formatPrice(item.detail.price)}
                                </div>

                                <div className="item-quantity">
                                    <div className="quantity-control">
                                        <Button
                                            size="small"
                                            icon={<MinusOutlined />}
                                            onClick={() =>
                                                handleUpdateQuantity(
                                                    item.id,
                                                    Math.max(1, item.quantity - 1)
                                                )
                                            }
                                            disabled={item.quantity <= 1}
                                        />
                                        <InputNumber
                                            min={1}
                                            max={item.detail.quantity}
                                            value={item.quantity}
                                            onChange={(value) =>
                                                handleUpdateQuantity(item.id, value || 1)
                                            }
                                            controls={false}
                                            className="quantity-input"
                                        />
                                        <Button
                                            size="small"
                                            icon={<PlusOutlined />}
                                            onClick={() =>
                                                handleUpdateQuantity(item.id, item.quantity + 1)
                                            }
                                            disabled={item.quantity >= item.detail.quantity}
                                        />
                                    </div>
                                </div>

                                <div className="item-total">
                                    {formatPrice(item.detail.price * item.quantity)}
                                </div>

                                <div className="item-action">
                                    <Popconfirm
                                        title="Xóa sản phẩm"
                                        description="Bạn có chắc muốn xóa sản phẩm này?"
                                        onConfirm={() => handleRemoveItem(item.id)}
                                        okText="Xóa"
                                        cancelText="Hủy"
                                    >
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                        />
                                    </Popconfirm>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-actions">
                        <Popconfirm
                            title="Xóa tất cả sản phẩm"
                            description="Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?"
                            onConfirm={handleClearCart}
                            okText="Xóa tất cả"
                            cancelText="Hủy"
                        >
                            <Button icon={<DeleteOutlined />} danger>
                                Xóa tất cả
                            </Button>
                        </Popconfirm>
                        <Button onClick={() => navigate("/books")}>
                            Tiếp tục mua sắm
                        </Button>
                    </div>
                </div>

                {/* Tổng tiền */}
                <div className="cart-summary-section">
                    <div className="summary-card">
                        <h2>Thông tin đơn hàng</h2>

                        <div className="summary-item">
                            <span>Tạm tính:</span>
                            <span className="summary-value">
                                {formatPrice(totalPrice)}
                            </span>
                        </div>

                        <div className="summary-item">
                            <span>Phí vận chuyển:</span>
                            <span className="summary-value">
                                {totalPrice >= 150000 ? (
                                    <span className="free-ship">Miễn phí</span>
                                ) : (
                                    formatPrice(30000)
                                )}
                            </span>
                        </div>

                        {totalPrice >= 150000 && (
                            <div className="summary-promotion">
                                <span>🎉 Bạn được miễn phí vận chuyển!</span>
                            </div>
                        )}

                        {totalPrice < 150000 && (
                            <div className="summary-note">
                                Mua thêm{" "}
                                <strong>
                                    {formatPrice(150000 - totalPrice)}
                                </strong>{" "}
                                để được freeship
                            </div>
                        )}

                        <div className="summary-divider"></div>

                        <div className="summary-total">
                            <span>Tổng cộng:</span>
                            <span className="total-value">
                                {formatPrice(
                                    totalPrice + (totalPrice >= 150000 ? 0 : 30000)
                                )}
                            </span>
                        </div>

                        <Button
                            type="primary"
                            size="large"
                            block
                            className="checkout-btn"
                            onClick={handleCheckout}
                        >
                            Tiến hành thanh toán
                        </Button>

                        <div className="summary-guarantee">
                            <h3>🛡️ Cam kết từ BookShop</h3>
                            <ul>
                                <li>✓ Sản phẩm chính hãng 100%</li>
                                <li>✓ Đổi trả miễn phí trong 7 ngày</li>
                                <li>✓ Hỗ trợ 24/7</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;