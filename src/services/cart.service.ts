/**
 * Nguồn dữ liệu duy nhất cho giỏ hàng.
 *
 * Trước đây logic đọc/ghi localStorage bị copy ở home.tsx, client.book.tsx,
 * book/item.tsx và checkout/cart.tsx — mỗi nơi một kiểu, không nơi nào bắt lỗi
 * JSON hỏng và không nơi nào chặn số lượng vượt tồn kho khi thêm vào giỏ.
 */

const CART_STORAGE_KEY = "carts";

/** Đọc giỏ hàng từ localStorage. Trả về [] nếu chưa có hoặc dữ liệu hỏng. */
export const readCart = (): ICart[] => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Bỏ qua các phần tử không đúng cấu trúc (dữ liệu cũ, bị sửa tay...)
    return parsed.filter(
      (item): item is ICart =>
        item && typeof item.id === "number" && item.detail
    );
  } catch {
    // JSON hỏng thì dọn luôn thay vì để app crash ở mọi lần render
    localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }
};

/** Ghi giỏ hàng xuống localStorage. */
export const writeCart = (carts: ICart[]): ICart[] => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(carts));
  } catch (error) {
    // Hết quota hoặc trình duyệt chặn storage — không nên làm hỏng luồng mua hàng
    console.error("Không ghi được giỏ hàng vào localStorage:", error);
  }
  return carts;
};

/** Xoá sạch giỏ hàng. */
export const clearCart = (): ICart[] => {
  localStorage.removeItem(CART_STORAGE_KEY);
  return [];
};

/** Giới hạn số lượng trong khoảng [1, tồn kho]. */
const clampToStock = (quantity: number, stock: number): number => {
  const safeStock = stock > 0 ? stock : 1;
  return Math.max(1, Math.min(quantity, safeStock));
};

export interface AddToCartResult {
  carts: ICart[];
  /** true khi số lượng yêu cầu bị cắt bớt vì vượt tồn kho */
  clamped: boolean;
  /** số lượng thực tế của sản phẩm trong giỏ sau thao tác */
  quantity: number;
}

/**
 * Thêm sách vào giỏ, cộng dồn nếu đã có.
 * Luôn kẹp theo tồn kho — trước đây người dùng có thể bấm "Thêm vào giỏ"
 * vô hạn lần và vượt quá số sách thực có.
 */
export const addToCart = (
  book: IBook,
  quantity: number = 1
): AddToCartResult => {
  const carts = readCart();
  const existingIndex = carts.findIndex((cart) => cart.id === book.id);

  const requested =
    existingIndex > -1 ? carts[existingIndex].quantity + quantity : quantity;
  const finalQuantity = clampToStock(requested, book.quantity);

  if (existingIndex > -1) {
    // Cập nhật cả `detail` để giá/tồn kho trong giỏ không bị cũ
    carts[existingIndex] = {
      ...carts[existingIndex],
      quantity: finalQuantity,
      detail: book,
    };
  } else {
    carts.push({ id: book.id, quantity: finalQuantity, detail: book });
  }

  return {
    carts: writeCart(carts),
    clamped: finalQuantity < requested,
    quantity: finalQuantity,
  };
};

/** Đặt lại số lượng của một sản phẩm (dùng ở màn giỏ hàng). */
export const updateCartQuantity = (
  bookId: number,
  quantity: number
): AddToCartResult => {
  const carts = readCart();
  const index = carts.findIndex((item) => item.id === bookId);
  if (index === -1) return { carts, clamped: false, quantity: 0 };

  const finalQuantity = clampToStock(quantity, carts[index].detail.quantity);
  carts[index] = { ...carts[index], quantity: finalQuantity };

  return {
    carts: writeCart(carts),
    clamped: finalQuantity < quantity,
    quantity: finalQuantity,
  };
};

/** Bỏ một sản phẩm khỏi giỏ. */
export const removeFromCart = (bookId: number): ICart[] =>
  writeCart(readCart().filter((item) => item.id !== bookId));

/** Tổng tiền hàng (chưa gồm phí vận chuyển). */
export const calculateSubtotal = (carts: ICart[] | null): number =>
  (carts ?? []).reduce(
    (sum, item) => sum + item.detail.price * item.quantity,
    0
  );

/** Ngưỡng miễn phí vận chuyển và mức phí — trước đây hardcode rải rác. */
export const FREE_SHIPPING_THRESHOLD = 150_000;
export const SHIPPING_FEE = 30_000;

export const calculateShippingFee = (subtotal: number): number =>
  subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

export const calculateGrandTotal = (subtotal: number): number =>
  subtotal + calculateShippingFee(subtotal);
