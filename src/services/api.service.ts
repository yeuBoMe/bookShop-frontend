import axios from "services/axios.customize";

// api module users
const ENDPOINT_CREATE_USER = "/api/v1/users";

const ENDPOINT_GET_REFRESH_TOKEN = "/api/v1/auth/refresh";

export const createUserAPI = () => {
  return null;
};

export const fetchAllUsersAPI = (current: number, pageSize: number) => {
  const ENDPOINT_FETCH_ALL_USERS = `/api/v1/users?page=${current}&size=${pageSize}`;
  return axios.get<IBackendRes<IModelPaginate<IUserTable>>>(
    ENDPOINT_FETCH_ALL_USERS
  );
};

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
