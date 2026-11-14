import axios from "services/axios.customize";

// Module user
export const createUserAPI = (
  fullName: string,
  email: string,
  password: string,
  phone: string
) => {
  return axios.post<IBackendRes<IUser>>("/api/v1/users", {
    fullName,
    email,
    password,
    phone,
  });
};

export const updateUserAPI = (id: number, fullName: string, phone: string) => {
  return axios.put<IBackendRes<IUser>>(`/api/v1/users/${id}`, {
    id,
    fullName,
    phone,
  });
};

export const updateUserPasswordAPI = (
  id: number,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) => {
  return axios.patch<IBackendRes<IUser>>(`/api/v1/users/${id}/password`, {
    id,
    currentPassword,
    newPassword,
    confirmPassword,
  });
};

export const updateUserAvatarAPI = (id: number, file: File) => {
  const formData = new FormData();
  formData.append("fileName", file);

  return axios.patch<IBackendRes<IUser>>(
    `/api/v1/users/${id}/avatar`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
};

export const updateUserAvatarToCloudAPI = (id: number, file: File) => {
  const formData = new FormData();
  formData.append("fileName", file);

  return axios.patch<IBackendRes<IUser>>(
    `/api/v1/users/${id}/avatar/cloud`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
};

export const deleteUserAvatarAPI = (id: number, fileName: string) => {
  return axios.delete<IBackendRes<IUser>>(`/api/v1/users/${id}/avatar`, {
    params: { fileName },
  });
};

export const deleteUserAvatarInCloudAPI = (id: number, fileName: string) => {
  return axios.delete<IBackendRes<IUser>>(`/api/v1/users/${id}/avatar/cloud`, {
    params: { fileName },
  });
};

export const deleteUserAPI = (id: number) => {
  return axios.delete<IBackendRes<IUser>>(`/api/v1/users/${id}`);
};

export const fetchAllUsersAPI = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IUserView>>>(
    `/api/v1/users?${query}`
  );
};

export const importListUsersFromFileAPI = (
  data: {
    fullName: string;
    email: string;
    phone: string;
  }[]
) => {
  return axios.post<
    IBackendRes<IResponseImportData<IDetailFaultInfo<IUserView>>>
  >("/api/v1/users/import", data);
};

// Module book
export const fetchAllBooksAPI = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IBook>>>(
    `/api/v1/books?${query}`
  );
};

export const fetchAllBooksWithAverageRatingAPI = (
  minRating: number,
  query: string
) => {
  return axios.get<IBackendRes<IModelPaginate<IBook>>>(
    `/api/v1/books/average-rating?minRating=${minRating}&${query}`
  );
};

export const createBookAPI = (
  name: string,
  author: string,
  price: number,
  quantity: number,
  category: { id: number } | null,
  introduceText: string,
  description: string,
  reader: string
) => {
  return axios.post<IBackendRes<IBook>>("/api/v1/books", {
    name,
    author,
    price,
    quantity,
    category,
    introduceText,
    description,
    reader,
  });
};

export const getBookByIdAPI = (id: number) => {
  return axios.get<IBackendRes<IBook>>(`/api/v1/books/${id}`);
};

export const updateBookAPI = (
  id: number,
  name: string,
  author: string,
  price: number,
  quantity: number,
  category: { id: number } | null,
  introduceText: string,
  description: string,
  reader: string
) => {
  return axios.patch<IBackendRes<IBook>>(`/api/v1/books/${id}`, {
    id,
    name,
    author,
    price,
    quantity,
    category,
    introduceText,
    description,
    reader,
  });
};

export const updateBookSingleImageAPI = (id: number, file: File) => {
  let config = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };

  const formData = new FormData();
  formData.append("file", file);

  return axios.patch<IBackendRes<IBook>>(
    `/api/v1/books/${id}/image`,
    formData,
    config
  );
};

export const updateBookSingleImageToCloudAPI = (id: number, file: File) => {
  let config = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };

  const formData = new FormData();
  formData.append("file", file);

  return axios.patch<IBackendRes<IBook>>(
    `/api/v1/books/${id}/image/cloud`,
    formData,
    config
  );
};

export const updateBookMultipleImagesAPI = (id: number, files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  return axios.patch<IBackendRes<IBook>>(
    `/api/v1/books/${id}/multiple-images`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
};

export const updateBookMultipleImagesToCloudAPI = (
  id: number,
  files: File[]
) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  return axios.patch<IBackendRes<IBook>>(
    `/api/v1/books/${id}/multiple-images/cloud`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
};

export const deleteBookSingleImageAPI = (id: number, imageName: string) => {
  return axios.delete<IBackendRes<IBook>>(`/api/v1/books/${id}/image`, {
    params: { imageName },
  });
};

export const deleteBookSingleImageInCloudAPI = (
  id: number,
  imageName: string
) => {
  return axios.delete<IBackendRes<IBook>>(`/api/v1/books/${id}/image/cloud`, {
    params: { imageName },
  });
};

export const deleteBookMultipleImagesAPI = (
  id: number,
  imageNames: string[]
) => {
  return axios.delete<IBackendRes<IBook>>(
    `/api/v1/books/${id}/multiple-images`,
    {
      data: imageNames,
    }
  );
};

export const deleteBookMultipleImagesInCloudAPI = (
  id: number,
  imageNames: string[]
) => {
  return axios.delete<IBackendRes<IBook>>(
    `/api/v1/books/${id}/multiple-images/cloud`,
    {
      data: imageNames,
    }
  );
};

export const deleteBookAPI = (id: number) => {
  return axios.delete<IBackendRes<IBook>>(`/api/v1/books/${id}`);
};

export const importListBooksFromFileAPI = (
  data: {
    name: string;
    author: string;
    price: number;
    quantity: number;
  }[]
) => {
  return axios.post<IBackendRes<IResponseImportData<IDetailFaultInfo<IBook>>>>(
    "/api/v1/books/import",
    data
  );
};

// Module category
export const fetchAllCategoriesSelectAPI = () => {
  return axios.get<IBackendRes<IModelPaginate<ICategory>>>(
    "/api/v1/categories"
  );
};

export const fetchAllCategoriesAPI = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<ICategory>>>(
    `/api/v1/categories?${query}`
  );
};

export const createCategoryAPI = (name: string) => {
  return axios.post<IBackendRes<ICategory>>("/api/v1/categories", { name });
};

export const updateCategoryAPI = (id: number, name: string) => {
  return axios.put<IBackendRes<ICategory>>(`/api/v1/categories/${id}`, {
    id,
    name,
  });
};

export const deleteCategoryAPI = (id: number) => {
  return axios.delete<IBackendRes<ICategory>>(`/api/v1/categories/${id}`);
};

export const importListCategoriesFromFileAPI = (
  data: {
    name: string;
  }[]
) => {
  return axios.post<
    IBackendRes<IResponseImportData<IDetailFaultInfo<ICategory>>>
  >("/api/v1/categories/import", data);
};

// Module order
export const createAnOrderAPI = (data: {
  name: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: string;
  totalPrice: number;
  status: string;
  detail: any;
}) => {
  return axios.post<IBackendRes<IOrder>>("/api/v1/orders", data);
};

export const getOrderHistoryAPI = () => {
  return axios.get<IBackendRes<IModelPaginate<IOrder>>>(
    "/api/v1/orders/history"
  );
};

export const fetchAllOrdersAPI = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IOrder>>>(
    `/api/v1/orders?${query}`
  );
};

export const updateOrderAPI = (id: number, status: string) => {
  return axios.patch<IBackendRes<IOrder>>(`/api/v1/orders/${id}`, {
    id,
    status,
  });
};

export const deleteOrderAPI = (id: number) => {
  return axios.delete<IBackendRes<IOrder>>(`/api/v1/orders/${id}`);
};

// Module vnpay
// export const createVnpayUrlAPI = (totalPrice: number) => {
//   return axios.post<IBackendRes<IVnPay>>(
//     "/api/v1/vnpay/create-url",
//     { amount: totalPrice }
//     // {
//     //   headers: {
//     //     "Content-Type": "application/json", // bắt buộc khi gửi number
//     //   },
//     // }
//   );
// };

// Module vnpay
export const createVnpayUrlAPI = (totalPrice: number, orderInfo: string) => {
  return axios.post<IBackendRes<IPay>>("/api/v1/vnpay/create-url", {
    amount: totalPrice,
    orderInfo: orderInfo,
  });
};

// Module momo pay
export const createMomopayUrlAPI = (totalPrice: number, orderInfo: string) => {
  return axios.post<IBackendRes<IPay>>("/api/v1/momo/create-url", {
    amount: totalPrice,
    orderInfo: orderInfo,
  });
};

// Module chatbot
export const chatbotAPI = (message: string) => {
  return axios.post<IBackendRes<IChatBot>>("/api/v1/chatbot", { message });
};

// Module rating
export const createRatingAPI = (data: {
  stars: number;
  comment: string;
  user: { id: number } | null;
  book: { id: number } | null;
}) => {
  return axios.post<IBackendRes<IRating>>("/api/v1/ratings", data);
};

export const fetchAllRatingsAPI = (query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IRating>>>(
    `/api/v1/ratings?${query}`
  );
};

export const fetchListRatingsByBookIdAPI = (bookId: number, query: string) => {
  return axios.get<IBackendRes<IModelPaginate<IRating>>>(
    `/api/v1/ratings/book/${bookId}?${query}`
  );
};

export const getRatingByUserIdAndBookIdAPI = (
  userId: number,
  bookId: number
) => {
  return axios.get<IBackendRes<IRating>>(
    `/api/v1/ratings/book/${bookId}/user/${userId}`
  );
};

export const deleteRatingAPI = (id: number) => {
  return axios.delete<IBackendRes<IRating>>(`/api/v1/ratings/${id}`);
};

// Module dashboard
export const getDashBoardInfoAPI = () => {
  return axios.get<IBackendRes<IDashBoard>>("/api/v1/dashboard");
};

// Module auth
export const loginAPI = (email: string, password: string) => {
  const data = {
    username: email,
    password: password,
  };
  return axios.post<IBackendRes<ILogin>>("/api/v1/auth/login", data);
};

export const registerAPI = (
  fullName: string,
  email: string,
  password: string,
  phone: string
) => {
  return axios.post<IBackendRes<IRegister>>("/api/v1/auth/register", {
    fullName,
    email,
    password,
    phone,
  });
};

export const getAccountInfoAPI = () => {
  return axios.get<IBackendRes<IAccount>>("/api/v1/auth/account");
};

export const logoutAPI = () => {
  return axios.post<IBackendRes<IAccount>>("/api/v1/auth/logout");
};

// Module dashboard - số liệu thống kê
/** Bỏ qua tham số rỗng để backend tự áp mặc định trong cấu hình. */
const buildStatisticsQuery = (from?: string, to?: string, topLimit?: number) => {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (topLimit) params.set("topLimit", String(topLimit));
  const query = params.toString();
  return query ? `?${query}` : "";
};

export const getDashboardStatisticsAPI = (
  from?: string,
  to?: string,
  topLimit?: number
) => {
  return axios.get<IBackendRes<IDashboardStatistics>>(
    `/api/v1/dashboard/statistics${buildStatisticsQuery(from, to, topLimit)}`
  );
};

export const getRevenueSummaryAPI = (from?: string, to?: string) => {
  return axios.get<IBackendRes<IRevenueSummary>>(
    `/api/v1/dashboard/revenue${buildStatisticsQuery(from, to)}`
  );
};

export const getRevenueByDayAPI = (from?: string, to?: string) => {
  return axios.get<IBackendRes<IRevenuePoint[]>>(
    `/api/v1/dashboard/revenue-by-day${buildStatisticsQuery(from, to)}`
  );
};

export const getOrdersByStatusAPI = (from?: string, to?: string) => {
  return axios.get<IBackendRes<IOrderStatusCount[]>>(
    `/api/v1/dashboard/order-status${buildStatisticsQuery(from, to)}`
  );
};

export const getTopSellingBooksAPI = (
  from?: string,
  to?: string,
  topLimit?: number
) => {
  return axios.get<IBackendRes<ITopBook[]>>(
    `/api/v1/dashboard/top-books${buildStatisticsQuery(from, to, topLimit)}`
  );
};

export const getTopCustomersAPI = (
  from?: string,
  to?: string,
  topLimit?: number
) => {
  return axios.get<IBackendRes<ITopCustomer[]>>(
    `/api/v1/dashboard/top-customers${buildStatisticsQuery(from, to, topLimit)}`
  );
};

export const getRevenueByCategoryAPI = (
  from?: string,
  to?: string,
  topLimit?: number
) => {
  return axios.get<IBackendRes<ICategoryRevenueShare[]>>(
    `/api/v1/dashboard/revenue-by-category${buildStatisticsQuery(from, to, topLimit)}`
  );
};

export const getLowStockBooksAPI = (topLimit?: number) => {
  return axios.get<IBackendRes<ILowStockBook[]>>(
    `/api/v1/dashboard/low-stock${buildStatisticsQuery(undefined, undefined, topLimit)}`
  );
};

// Module import theo dòng - mỗi dòng mang thao tác riêng, tính đúng/sai độc lập
export const importBooksBatchAPI = (data: IBookImportRow[]) => {
  return axios.post<IBackendRes<IResponseImportData<IDetailFaultInfo<IBook>>>>(
    "/api/v1/books/import/batch",
    data
  );
};

export const importCategoriesBatchAPI = (
  data: { name: string; action?: TImportAction }[]
) => {
  return axios.post<
    IBackendRes<IResponseImportData<IDetailFaultInfo<ICategory>>>
  >("/api/v1/categories/import/batch", data);
};

export const importUsersBatchAPI = (
  data: {
    fullName?: string;
    email: string;
    phone?: string;
    action?: TImportAction;
  }[]
) => {
  return axios.post<IBackendRes<IResponseImportData<IDetailFaultInfo<IUserView>>>>(
    "/api/v1/users/import/batch",
    data
  );
};

// Module tìm kiếm sách theo con trỏ (keyset) — dùng cho cuộn "xem thêm" phía khách
export const searchBooksAPI = (params: IBookSearchParams) => {
  const query = new URLSearchParams();

  if (params.keyword) query.set("keyword", params.keyword);
  if (params.categoryName) query.set("categoryName", params.categoryName);
  // Nhiều thể loại: lặp lại cùng một tên tham số, Spring gom thành List
  params.categoryIds?.forEach((id) => query.append("categoryIds", String(id)));
  if (params.minPrice != null) query.set("minPrice", String(params.minPrice));
  if (params.maxPrice != null) query.set("maxPrice", String(params.maxPrice));
  if (params.minRating) query.set("minRating", String(params.minRating));
  if (params.sort) query.set("sort", params.sort);
  if (params.cursor) query.set("cursor", params.cursor);
  if (params.size) query.set("size", String(params.size));

  return axios.get<IBackendRes<ICursorPage<IBook>>>(
    `/api/v1/books/search?${query.toString()}`
  );
};

// Module export theo luồng — tải toàn bộ dữ liệu theo bộ lọc, không giới hạn ở trang đang xem
/** responseType blob: backend trả CSV thô, không phải JSON bọc trong GlobalResponse. */
export const exportBooksCsvAPI = (params: IBookSearchParams) => {
  const query = new URLSearchParams();

  if (params.keyword) query.set("keyword", params.keyword);
  if (params.categoryName) query.set("categoryName", params.categoryName);
  params.categoryIds?.forEach((id) => query.append("categoryIds", String(id)));
  if (params.minPrice != null) query.set("minPrice", String(params.minPrice));
  if (params.maxPrice != null) query.set("maxPrice", String(params.maxPrice));
  if (params.minRating) query.set("minRating", String(params.minRating));

  return axios.get<Blob>(`/api/v1/exports/books.csv?${query.toString()}`, {
    responseType: "blob",
  });
};

export const exportOrdersCsvAPI = (status?: string) => {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return axios.get<Blob>(`/api/v1/exports/orders.csv${query}`, {
    responseType: "blob",
  });
};
