export {};

declare global {
  interface IBackendRes<T> {
    statusCode: number | string;
    message: string;
    error?: string | string[];
    data?: T;
  }

  interface IModelPaginate<T> {
    meta: {
      current: number;
      pageSize: number;
      pages: number;
      total: number;
    };
    result: T[];
  }

  interface ILogin {
    access_token: string;
    user: {
      id: number;
      name: string;
      email: string;
      avatar?: string;
      phone: string;
      role?: {
        id: number;
        name: string;
        permission?: {
          id: string;
          name: string;
          apiPath: string;
          method: string;
          module: string;
        }[];
      };
    };
  }

  interface IRegister {
    id: number;
    fullName: string;
    email: string;
    avatar?: string;
    phone: string;
    // createdAt: string;
    // createdBy: string;
    role?: {
      id: number;
      name: string;
    };
  }

  interface IAccount {
    user: {
      id: number;
      name: string;
      email: string;
      avatar?: string;
      phone: string;
      role?: {
        id: number;
        name: string;
        permission?: {
          id: string;
          name: string;
          apiPath: string;
          method: string;
          module: string;
        }[];
      };
    };
  }

  interface IUser {
    id: number;
    fullName: string;
    email: string;
    avatar?: string;
    phone: string;
    role?: { id: number; name: string };
  }

  interface IUserView {
    id: number;
    fullName: string;
    email: string;
    avatar?: string;
    phone: string;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    role?: { id: number; name: string };
  }

  interface IResponseImportUsers<T> {
    countSuccess: number;
    countError: number;
    detail?: T;
    users?: {
      id: number;
      fullName: string;
      email: string;
      avatar?: string;
      phone: string;
      createdAt: Date;
      createdBy: string;
      role?: {
        id: number;
        name: string;
      };
    }[];
  }

  interface IUserListImportInfo {
    index: number;
    errorMessage: string;
    user: {
      id?: number;
      fullName: string;
      email: string;
      avatar?: string;
      phone: string;
      createdAt?: Date;
      createdBy?: string;
      role?: {
        id: number;
        name: string;
      };
    };
  }
}
