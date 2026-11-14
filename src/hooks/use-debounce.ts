import { useEffect, useState } from "react";

/**
 * Trả về giá trị đã được trì hoãn `delay` ms.
 *
 * Dùng cho ô tìm kiếm: trước đây mỗi ký tự gõ vào đều bắn một request
 * `GET /api/v1/books`, nên gõ "harry potter" tạo ra 12 request liên tiếp và
 * kết quả có thể về không đúng thứ tự (race condition).
 */
export const useDebounce = <T,>(value: T, delay: number = 400): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};
