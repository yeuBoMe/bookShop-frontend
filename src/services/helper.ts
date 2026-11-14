import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export const FORMATE_DATE = "YYYY-MM-DD";

export const dateRangeValidate = (dateRange: any) => {
  if (!dateRange || !dateRange[0] || !dateRange[1]) return undefined;

  const startDate =
    dayjs(dateRange[0]).utc().format("YYYY-MM-DDTHH:mm:ss.SSS000") + "Z";
  const endDate =
    dayjs(dateRange[1]).utc().format("YYYY-MM-DDTHH:mm:ss.SSS000") + "Z";

  return [startDate, endDate];
};

/**
 * Base URL của kho ảnh. Gom về một chỗ thay vì lặp lại
 * `import.meta.env.VITE_IMAGE_URL || "..."` ở từng component.
 */
const IMAGE_BASE_URL =
  import.meta.env.VITE_IMAGE_URL ||
  "https://res.cloudinary.com/dvglvfask/image/upload";

/**
 * Ảnh thay thế khi sách/user chưa có ảnh (SVG inline, không phụ thuộc dịch vụ ngoài).
 *
 * Dùng biểu tượng thay vì dòng chữ "No Image": module này không nằm trong cây
 * React nên không gọi được t(), mà để một câu tiếng Anh cố định thì lệch tông
 * khi người dùng đang xem giao diện tiếng Việt.
 */
export const IMAGE_PLACEHOLDER =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="280">
       <rect width="100%" height="100%" fill="#eef1f5"/>
       <g fill="none" stroke="#b9c0ca" stroke-width="6" stroke-linejoin="round">
         <rect x="62" y="104" width="76" height="60" rx="6"/>
         <path d="M62 150l22-20 16 14 20-22 18 20"/>
       </g>
       <circle cx="88" cy="122" r="6" fill="#b9c0ca"/>
     </svg>`
  );

/** Ghép tên file ảnh với base URL. Trả về ảnh placeholder khi không có ảnh. */
export const getImageUrl = (fileName?: string | null): string => {
  if (!fileName) return IMAGE_PLACEHOLDER;
  if (/^https?:\/\//i.test(fileName)) return fileName;
  return `${IMAGE_BASE_URL}/${fileName}`;
};

/** Ảnh đầu tiên của một cuốn sách. */
export const getBookImageUrl = (images?: string[] | null): string =>
  getImageUrl(images && images.length > 0 ? images[0] : null);

const VND_FORMATTER = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

/** Định dạng tiền VND. Trước đây hàm này bị copy ở 6 file khác nhau. */
export const formatPrice = (price?: number | null): string =>
  VND_FORMATTER.format(price ?? 0);

/**
 * Làm sạch giá trị người dùng nhập trước khi nhúng vào query của springfilter.
 *
 * Query được ghép bằng chuỗi (`name~~'<giá trị>'`) nên một dấu nháy đơn trong ô
 * tìm kiếm là đủ để phá vỡ cú pháp, hoặc bị lợi dụng để chèn thêm điều kiện lọc.
 * springfilter không có cú pháp escape đáng tin cậy cho string literal, nên ở đây
 * loại bỏ hẳn các ký tự có thể thoát khỏi literal thay vì tìm cách escape chúng.
 */
export const escapeFilterValue = (value: string): string =>
  value.replace(/['"\\]/g, "").trim();

/**
 * Lưu blob nhận từ API thành file trên máy người dùng.
 *
 * Không dùng thẻ <a href> trỏ thẳng vào endpoint được: request cần header
 * Authorization mà thẻ <a> thì không gắn được, nên phải tải qua axios rồi mới lưu.
 */
export const downloadBlobAsFile = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();

  // Gỡ ngay để không giữ blob trong bộ nhớ sau khi đã lưu xong
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
