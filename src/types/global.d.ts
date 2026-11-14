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
    sold?: string;
    averageStars: number;
    ratingCount?: number;
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
    countUsers: number;
    countBooks: number;
    countCategories: number;
    countRatings: number;
  }

  interface IRevenueSummary {
    totalRevenue: number;
    paidOrderCount: number;
    averageOrderValue: number;
  }

  interface IRevenuePoint {
    day: string;
    revenue: number;
    orderCount: number;
  }

  interface IOrderStatusCount {
    status: string;
    orderCount: number;
  }

  interface ITopBook {
    bookId: number;
    name: string;
    author: string;
    soldQuantity: number;
    revenue: number;
  }

  interface ITopCustomer {
    email: string;
    name: string;
    orderCount: number;
    totalSpent: number;
  }

  interface ILowStockBook {
    bookId: number;
    name: string;
    author: string;
    quantity: number;
  }

  /** Một lát cắt của biểu đồ tròn tỷ trọng doanh thu theo thể loại. */
  interface ICategoryRevenueShare {
    categoryId: number | null;
    name: string;
    revenue: number;
    soldQuantity: number;
    percentage: number;
  }

  interface IDashboardStatistics {
    fromTime: string;
    toTime: string;
    revenue: IRevenueSummary;
    revenueByDay: IRevenuePoint[];
    ordersByStatus: IOrderStatusCount[];
    topSellingBooks: ITopBook[];
    topCustomers: ITopCustomer[];
    revenueByCategory: ICategoryRevenueShare[];
    lowStockBooks: ILowStockBook[];
  }

  /**
   * Trang dữ liệu theo con trỏ. KHÔNG có tổng số bản ghi — đó là chủ đích:
   * bỏ count(*) và OFFSET nên trang sau không chậm dần theo độ sâu.
   */
  interface ICursorPage<T> {
    items: T[];
    nextCursor: string | null;
    hasNext: boolean;
    size: number;
  }

  type TBookSort = "NEWEST" | "PRICE_ASC" | "PRICE_DESC" | "RATING_DESC";

  interface IBookSearchParams {
    keyword?: string;
    categoryIds?: number[];
    categoryName?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sort?: TBookSort;
    cursor?: string | null;
    size?: number;
  }

  /** Thao tác của một dòng khi import theo dòng. Bỏ trống = CREATE. */
  type TImportAction = "CREATE" | "UPDATE" | "DELETE";

  /**
   * Một dòng trong file import sách. Mọi trường đều tuỳ chọn vì dòng DELETE
   * chỉ cần khoá định danh (name + author), không phải khai đủ cột.
   */
  interface IBookImportRow {
    action?: TImportAction;
    name?: string;
    author?: string;
    price?: number;
    quantity?: number;
    introduceText?: string;
    description?: string;
    reader?: string;
    category?: string;
  }

  interface IPay {
    paymentUrl: string;
  }

  interface IChatBot {
    message: string;
  }

  // WebSocket Message
  interface IWebSocket {
    sender: string; // EMAIL của người gửi
    receiver: string; // EMAIL của người nhận
    content: string;
    timestamp: string;
    from: "USER" | "ADMIN";
    userAvatar?: string; 
  }

  // Admin Conversation
  interface IAdminConversation {
    userEmail: string; // EMAIL - dùng để route message
    userName: string; // Tên hiển thị
    userAvatar?: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    messages: IAdminMessage[];
  }

  // Admin Message
  interface IAdminMessage {
    from: "USER" | "ADMIN";
    text: string;
    timestamp: string;
    userEmail?: string; // EMAIL của user gửi
  }

  // User Message
  interface IUserMessage {
    from: "USER" | "ADMIN";
    text: string;
    timestamp: string;
  }
}
