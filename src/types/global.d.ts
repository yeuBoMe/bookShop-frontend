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
    role?: { id: number; name: string };
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
  }

  interface IResponseImportData<T> {
    countSuccess: number;
    countError: number;
    detail: any;
    items: T[];
  }

  interface IDetailFaultInfo<T> {
    index: number;
    errorMessage: any;
    item: T;
  }

  interface IBook {
    id: number;
    name: string;
    category: string;
    price: number;
    quantity: number;
    images: string[];
    author: string;
    introduceText: string;
    description: string;
    reader: string;
    averageStars: double;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
  }

  interface ICategory {
    id: number;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
  }

  interface ICart {
    id: number;
    quantity: number; // book quantity
    detail: IBook;
  }

  interface IOrder {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    paymentMethod: string;
    totalPrice: number;
    status: string;
    detail: IOrderDetail[];
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
  }

  interface IOrderDetail {
    id: number;
    quantity: number;
    bookName: string;
    price: number;
  }

  interface IRating {
    id: number;
    stars: number;
    comment: string;
    user: {
      id: number;
      name: string;
      avatar: string;
    };
    book: string;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
  }

  interface IDashBoard {
    countOrders: number;
    countBooks: number;
    countUsers: number;
    countCategories: number;
    countRatings: number;
  }

  interface IVnPay {
    paymentUrl: string;
  }
}
