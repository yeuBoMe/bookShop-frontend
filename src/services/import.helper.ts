import Exceljs from "exceljs";

/** Màu tag cho từng thao tác trong bảng xem trước. */
export const IMPORT_ACTION_COLORS: Record<string, string> = {
  CREATE: "green",
  UPDATE: "blue",
  DELETE: "red",
};

/** Cột Action trong file có thể viết hoa/thường tuỳ người nhập; bỏ trống thì hiểu là CREATE. */
export const normalizeImportAction = (value: unknown): TImportAction => {
  const text = String(value ?? "").trim().toUpperCase();
  return text === "UPDATE" || text === "DELETE" ? text : "CREATE";
};

/** Ô trống trả về undefined thay vì chuỗi rỗng, để backend phân biệt "không khai" với "khai rỗng". */
export const asImportText = (value: unknown): string | undefined => {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : undefined;
};

export const asImportNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

/** Backend trả một chuỗi lỗi hoặc một mảng chuỗi — gộp lại cho dễ đọc trong bảng. */
export const formatImportError = (errorMessage: unknown): string => {
  if (Array.isArray(errorMessage)) return errorMessage.join("; ");
  return String(errorMessage ?? "");
};

/**
 * Đọc file Excel thành danh sách bản ghi, lấy dòng đầu làm tên cột.
 * Trả về `Record<string, unknown>` chứ không ép kiểu sẵn: mỗi màn hình tự ánh xạ
 * sang kiểu của mình, nên thêm/bớt cột không phải sửa hàm này.
 */
export const parseWorkbookRows = async (
  file: File
): Promise<Record<string, unknown>[]> => {
  const workbook = new Exceljs.Workbook();
  const arrayBuffer = await file.arrayBuffer();
  await workbook.xlsx.load(arrayBuffer);

  const rows: Record<string, unknown>[] = [];

  workbook.worksheets.forEach((sheet) => {
    const firstRow = sheet.getRow(1);
    if (!firstRow.cellCount) return;

    const headers = firstRow.values as unknown[];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const values = row.values as unknown[];
      const record: Record<string, unknown> = {};
      for (let i = 1; i < headers.length; i++) {
        record[String(headers[i])] = values[i];
      }
      rows.push(record);
    });
  });

  return rows;
};
