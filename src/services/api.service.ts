import axios from "services/axios.customize";

const ENDPOINT_GET_REFRESH_TOKEN = "/api/v1/auth/refresh";

// Module user
export const createUserAPI = (
  fullName: string,
  email: string,
  password: string,
  phone: string
) => {
  const ENDPOINT_CREATE_USER = "/api/v1/users";
  const data = {
    fullName: fullName,
    email: email,
    password: password,
    phone: phone,
  };
  return axios.post<IBackendRes<IUser>>(ENDPOINT_CREATE_USER, data);
};

export const updateUserAPI = (id: number, fullName: string, phone: string) => {
  const ENDPOINT_UPDATE_USER = `/api/v1/users/${id}`;
  const data = {
    id: id,
    fullName: fullName,
    phone: phone,
  };
  return axios.put<IBackendRes<IUser>>(ENDPOINT_UPDATE_USER, data);
};

export const updateUserPasswordAPI = (
  id: number,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) => {
  const data = {
    currentPassword: currentPassword,
    newPassword: newPassword,
    confirmPassword: confirmPassword,
  };
  const ENDPOINT_UPDATE_USER_PASSWORD = `/api/v1/users/${id}/password`;
  return axios.patch<IBackendRes<IUser>>(ENDPOINT_UPDATE_USER_PASSWORD, data);
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
  const ENDPOINT_DELETE_USER = `/api/v1/users/${id}`;
  return axios.delete<IBackendRes<IUser>>(ENDPOINT_DELETE_USER);
};

export const fetchAllUsersAPI = (query: string) => {
  const ENDPOINT_FETCH_ALL_USERS = `/api/v1/users?${query}`;
  return axios.get<IBackendRes<IModelPaginate<IUserView>>>(
    ENDPOINT_FETCH_ALL_USERS
  );
};

export const importListUsersFromFileAPI = (
  data: {
    fullName: string;
    email: string;
    phone: string;
  }[]
) => {
  const ENDPOINT_IMPORT_USERS_FROM_FILE = "/api/v1/users/import";
  return axios.post<
    IBackendRes<IResponseImportData<IDetailFaultInfo<IUserView>>>
  >(ENDPOINT_IMPORT_USERS_FROM_FILE, data);
};

// Module book
export const fetchAllBooksAPI = (query: string) => {
  const ENDPOINT_FETCH_ALL_BOOKS = `/api/v1/books?${query}`;
  return axios.get<IBackendRes<IModelPaginate<IBook>>>(
    ENDPOINT_FETCH_ALL_BOOKS
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
  const data = {
    name: name,
    author: author,
    price: price,
    quantity: quantity,
    category: category,
    introduceText: introduceText,
    description: description,
    reader: reader,
  };
  const ENDPOINT_CREATE_BOOK = "/api/v1/books";
  return axios.post<IBackendRes<IBook>>(ENDPOINT_CREATE_BOOK, data);
};

export const getBookByIdAPI = (id: number) => {
  const ENDPOINT_GET_BOOK_BY_ID = `/api/v1/books/${id}`;
  return axios.get<IBackendRes<IBook>>(ENDPOINT_GET_BOOK_BY_ID);
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
  const data = {
    id: id,
    name: name,
    author: author,
    price: price,
    quantity: quantity,
    category: category,
    introduceText: introduceText,
    description: description,
    reader: reader,
  };
  const ENDPOINT_UPDATE_BOOK = `/api/v1/books/${id}`;
  return axios.patch<IBackendRes<IBook>>(ENDPOINT_UPDATE_BOOK, data);
};

export const updateBookSingleImageAPI = (id: number, file: File) => {
  let config = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };

  const formData = new FormData();
  formData.append("file", file);

  const ENDPOINT_UPDATE_BOOK_SINGLE_IMAGE = `/api/v1/books/${id}/image`;

  return axios.patch<IBackendRes<IBook>>(
    ENDPOINT_UPDATE_BOOK_SINGLE_IMAGE,
    formData,
    config
  );
};

export const updateBookMultipleImagesAPI = (id: number, files: File[]) => {
  const ENDPOINT_UPDATE_BOOK_MULTIPLE_IMAGES = `/api/v1/books/${id}/multiple-images`;

  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  return axios.patch<IBackendRes<IBook>>(
    ENDPOINT_UPDATE_BOOK_MULTIPLE_IMAGES,
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
  const ENDPOINT_DELETE_BOOK = `/api/v1/books/${id}`;
  return axios.delete<IBackendRes<IBook>>(ENDPOINT_DELETE_BOOK);
};

export const importListBooksFromFileAPI = (
  data: {
    name: string;
    author: string;
    price: number;
    quantity: number;
  }[]
) => {
  const ENDPOINT_IMPORT_BOOKS_FROM_FILE = "/api/v1/books/import";
  return axios.post<IBackendRes<IResponseImportData<IDetailFaultInfo<IBook>>>>(
    ENDPOINT_IMPORT_BOOKS_FROM_FILE,
    data
  );
};

// Module category
export const fetchAllCategoriesAPI = () => {
  const ENDPOINT_FETCH_ALL_CATEGORIES = "/api/v1/categories";
  return axios.get<IBackendRes<IModelPaginate<ICategory>>>(
    ENDPOINT_FETCH_ALL_CATEGORIES
  );
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
  const ENDPOINT_CREATE_ORDER = "/api/v1/orders";
  return axios.post<IBackendRes<IOrder>>(ENDPOINT_CREATE_ORDER, data);
};

export const getOrderHistoryAPI = () => {
  const ENDPOINT_GET_ORDER_HISTORY = "/api/v1/orders/history";
  return axios.get<IBackendRes<IModelPaginate<IOrder>>>(
    ENDPOINT_GET_ORDER_HISTORY
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
  const ENDPOINT_UPDATE_ORDER = `/api/v1/orders/${id}`;
  return axios.put<IBackendRes<IOrder>>(ENDPOINT_UPDATE_ORDER, data);
};

export const deleteOrderAPI = (id: number) => {
  const ENDPOINT_DELETE_ORDER = `/api/v1/orders/${id}`;
  return axios.delete<IBackendRes<IOrder>>(ENDPOINT_DELETE_ORDER);
};

// Module auth
export const loginAPI = (email: string, password: string) => {
  const ENDPOINT_LOGIN = "/api/v1/auth/login";
  const data = {
    username: email,
    password: password,
  };
  return axios.post<IBackendRes<ILogin>>(ENDPOINT_LOGIN, data);
};

export const registerAPI = (
  fullName: string,
  email: string,
  password: string,
  phone: string
) => {
  const ENDPOINT_REGISTER = "/api/v1/auth/register";
  const data = {
    fullName: fullName,
    email: email,
    password: password,
    phone: phone,
  };
  return axios.post<IBackendRes<IRegister>>(ENDPOINT_REGISTER, data);
};

export const getAccountInfoAPI = () => {
  const ENDPOINT_GET_ACCOUNT_INFO = "/api/v1/auth/account";
  return axios.get<IBackendRes<IAccount>>(ENDPOINT_GET_ACCOUNT_INFO);
};

export const logoutAPI = () => {
  const ENDPOINT_LOGOUT = "/api/v1/auth/logout";
  return axios.post<IBackendRes<IAccount>>(ENDPOINT_LOGOUT);
};
