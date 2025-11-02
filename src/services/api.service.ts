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

export const deleteUserAvatarAPI = (id: number, fileName: string) => {
  return axios.delete<IBackendRes<IUser>>(`/api/v1/users/${id}/avatar`, {
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

export const deleteBookSingleImageAPI = (id: number, imageName: string) => {
  return axios.delete<IBackendRes<IBook>>(`/api/v1/books/${id}/image`, {
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
  const ENDPOINT_FETCH_ALL_ORDERS = `/api/v1/orders?${query}`;
  return axios.get<IBackendRes<IModelPaginate<IOrder>>>(
    ENDPOINT_FETCH_ALL_ORDERS
  );
};

export const updateOrderAPI = (id: number, status: string) => {
  const data = {
    id: id,
    status: status,
  };
  return axios.patch<IBackendRes<IOrder>>(`/api/v1/orders/${id}`, data);
};

export const deleteOrderAPI = (id: number) => {
  return axios.delete<IBackendRes<IOrder>>(`/api/v1/orders/${id}`);
};

// Module dashboard
export const getDashBoardInfoAPI = () => {
  return axios.get<IBackendRes<IDashBoard>>("/api/v1/dashboards");
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
