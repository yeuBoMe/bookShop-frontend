import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { App, Button, InputNumber, Popconfirm } from "antd";
import { DeleteOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import "styles/client/checkout/cart.scss";
import {
    updateCartQuantity,
    removeFromCart,
    clearCart,
    calculateShippingFee,
    calculateGrandTotal,
    FREE_SHIPPING_THRESHOLD,
} from "@/services/cart.service";
import { formatPrice, getBookImageUrl } from "@/services/helper";

interface CartProps {
    carts: ICart[];
    setCarts: (carts: ICart[]) => void;
    totalPrice: number;
    onContinueToPayment: () => void;
}

const Cart = (props: CartProps) => {
    const { carts, setCarts, totalPrice, onContinueToPayment } = props;
    const navigate = useNavigate();
    const { message } = App.useApp();

    const { t } = useTranslation();

    const handleUpdateQuantity = (bookId: number, newQuantity: number) => {
        const { carts: updatedCarts, clamped, quantity } = updateCartQuantity(bookId, newQuantity);
        if (clamped) {
            message.warning(t("cart.stockOnly", { count: quantity }));
        }
        setCarts(updatedCarts);
    };

    const handleRemoveItem = (bookId: number) => {
        setCarts(removeFromCart(bookId));
        message.success(t("cart.removed"));
    };

    const handleClearCart = () => {
        setCarts(clearCart());
        message.success(t("cart.removedAll"));
    };

    return (
        <div className="cart-content">
            <div className="cart-items-section">
                <div className="cart-items-header">
                    <span className="header-product">{t("cart.colProduct")}</span>
                    <span className="header-price">{t("cart.colPrice")}</span>
                    <span className="header-quantity">{t("cart.colQuantity")}</span>
                    <span className="header-total">{t("cart.colTotal")}</span>
                    <span className="header-action">{t("cart.colAction")}</span>
                </div>

                <div className="cart-items-list">
                    {carts.map((item) => (
                        <div key={item.id} className="cart-item">
                            <div className="item-product">
                                <img
                                    src={getBookImageUrl(item.detail.images)}
                                    alt={item.detail.name}
                                />
                                <div className="item-info">
                                    <h3
                                        className="item-name"
                                        onClick={() => navigate(`/books/${item.id}`)}
                                    >
                                        {item.detail.name}
                                    </h3>
                                    <p className="item-category">
                                        {item.detail.category}
                                    </p>
                                    <p className="item-stock">
                                        {t("cart.remaining", { count: item.detail.quantity })}
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
                                    title={t("cart.removeTitle")}
                                    description={t("cart.removeConfirm")}
                                    onConfirm={() => handleRemoveItem(item.id)}
                                    okText={t("cart.remove")}
                                    cancelText={t("common.cancel")}
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
                    {carts.length > 1 ? (
                        <Popconfirm
                            title={t("cart.removeAllTitle")}
                            description={t("cart.removeAllConfirm")}
                            onConfirm={handleClearCart}
                            okText={t("cart.removeAll")}
                            cancelText={t("common.cancel")}
                        >
                            <Button icon={<DeleteOutlined />} danger>
                                {t("cart.removeAll")}
                            </Button>
                        </Popconfirm>
                    ) : (
                        <></>
                    )}
                    <Button onClick={() => navigate("/books")}>
                        {t("cart.keepShopping")}
                    </Button>
                </div>
            </div>

            <div className="cart-summary-section">
                <div className="summary-card">
                    <h2>{t("cart.summary")}</h2>

                    <div className="summary-item">
                        <span>{t("payment.subtotal")}</span>
                        <span className="summary-value">
                            {formatPrice(totalPrice)}
                        </span>
                    </div>

                    <div className="summary-item">
                        <span>{t("payment.shipping")}</span>
                        <span className="summary-value">
                            {calculateShippingFee(totalPrice) === 0 ? (
                                <span className="free-ship">{t("payment.free")}</span>
                            ) : (
                                formatPrice(calculateShippingFee(totalPrice))
                            )}
                        </span>
                    </div>

                    {totalPrice >= FREE_SHIPPING_THRESHOLD && (
                        <div className="summary-promotion">
                            <span>{t("cart.freeShipEarned")}</span>
                        </div>
                    )}

                    {totalPrice < FREE_SHIPPING_THRESHOLD && (
                        <div className="summary-note">
                            {t("cart.freeShipHintPrefix")}{" "}
                            <strong>{formatPrice(FREE_SHIPPING_THRESHOLD - totalPrice)}</strong>{" "}
                            {t("cart.freeShipHintSuffix")}
                        </div>
                    )}

                    <div className="summary-divider"></div>

                    <div className="summary-total">
                        <span>{t("payment.grandTotal")}</span>
                        <span className="total-value">
                            {formatPrice(calculateGrandTotal(totalPrice))}
                        </span>
                    </div>

                    <Button
                        type="primary"
                        size="large"
                        block
                        className="checkout-btn"
                        onClick={onContinueToPayment}
                    >
                        {t("cart.checkout")}
                    </Button>

                    <div className="summary-guarantee">
                        <h3>{t("cart.promiseTitle")}</h3>
                        <ul>
                            <li>{t("cart.promise1")}</li>
                            <li>{t("cart.promise2")}</li>
                            <li>{t("cart.promise3")}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;