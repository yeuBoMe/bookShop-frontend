import { App } from "antd";
import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCurrentApp } from "@/components/context/app.context";
import { addToCart } from "@/services/cart.service";

/**
 * Gói toàn bộ luồng "thêm vào giỏ hàng" vào một chỗ.
 *
 * Cùng một đoạn code (kiểm tra đăng nhập → đọc localStorage → cộng dồn → ghi lại
 * → setCarts → message) trước đây bị lặp gần như nguyên vẹn ở home.tsx,
 * client.book.tsx và book/item.tsx. Sửa một chỗ thì hai chỗ kia vẫn còn bug.
 */
export const useAddToCart = () => {
  const { user, setCarts } = useCurrentApp();
  const { message, notification } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  return useCallback(
    (book: IBook, quantity: number = 1): boolean => {
      if (!user?.id) {
        notification.warning({
          message: t("cart.notLoggedIn"),
          description: t("cart.notLoggedInDesc"),
          duration: 3,
          placement: "topRight",
        });
        // Đăng nhập xong quay lại đúng trang đang xem, thay vì luôn về trang chủ
        const redirectTo = encodeURIComponent(location.pathname + location.search);
        navigate(`/login?redirect=${redirectTo}`);
        return false;
      }

      if (!book) return false;

      if (book.quantity <= 0) {
        message.warning(t("cart.outOfStock", { name: book.name }));
        return false;
      }

      const { carts, clamped, quantity: finalQuantity } = addToCart(book, quantity);
      setCarts(carts);

      if (clamped) {
        message.warning(
          t("cart.stockLimited", { count: finalQuantity, name: book.name })
        );
      } else {
        message.success(t("cart.added", { count: quantity, name: book.name }));
      }

      return true;
    },
    [user, setCarts, message, notification, navigate, location, t]
  );
};
