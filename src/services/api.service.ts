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

export const deleteUserAPI = (id: number) => {
  const ENDPOINT_DELETE_USER = `/api/v1/users/${id}`;
  return axios.delete<IBackendRes<IUser>>(ENDPOINT_DELETE_USER);
};

// export const fetchAllUsersAPI = (current: number, pageSize: number) => {
//   const ENDPOINT_FETCH_ALL_USERS = `/api/v1/users?page=${current}&size=${pageSize}`;
//   return axios.get<IBackendRes<IModelPaginate<IUserTable>>>(
//     ENDPOINT_FETCH_ALL_USERS
//   );
// };
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
}

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
  const ENDPOINT_FETCH_ALL_CATEGORIES = `/api/v1/categories`;
  return axios.get<IBackendRes<IModelPaginate<ICategory>>>(
    ENDPOINT_FETCH_ALL_CATEGORIES
  );
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
