import { StrictMode, Suspense, lazy, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { App, Spin } from 'antd';
import { AuthProvider } from '@/components/context/app.context';
import { ThemeProvider } from '@/components/context/theme.context';
import ThemedConfigProvider from '@/components/layout/themed.config.provider';

import ProtectedRoute from 'components/auth/private.route';

import Layout from '@/layout';
import ErrorPage from 'pages/not-found/error';

// Nạp cấu hình đa ngôn ngữ trước khi render — i18n.init() chạy đồng bộ nên
// component đầu tiên đã có sẵn bản dịch, không bị nháy tên key.
import '@/i18n';
import "styles/global.scss";

/**
 * Tách bundle theo route.
 *
 * Trước đây toàn bộ trang (kể cả khu admin với @ant-design/pro-components,
 * exceljs, react-csv) được import tĩnh vào main.tsx, nên một khách vãng lai chỉ
 * xem trang chủ vẫn phải tải toàn bộ code quản trị. Dùng lazy() để mỗi route
 * thành một chunk riêng, chỉ tải khi thực sự truy cập.
 */
const AdminLayout = lazy(() => import('components/layout/admin.layout'));

const HomePage = lazy(() => import('pages/client/home'));
const BookPage = lazy(() => import('@/pages/client/client.book'));
const BookDetailPage = lazy(() => import('@/pages/client/book/item'));
const AboutPage = lazy(() => import('pages/client/about'));
const ProfilePage = lazy(() => import('pages/client/profile'));
const OrderPage = lazy(() => import('@/pages/client/order.history'));
const CheckoutPage = lazy(() => import('@/pages/client/shop/checkout'));
const CheckoutFail = lazy(() => import('@/components/client/checkout/checkout-fail'));

const LoginPage = lazy(() => import('pages/auth/login'));
const RegisterPage = lazy(() => import('pages/auth/register'));

const DashBoardPage = lazy(() => import('@/pages/admin/dashboard'));
const ManageBookPage = lazy(() => import('pages/admin/manage.book'));
const ManageOrderPage = lazy(() => import('pages/admin/manage.order'));
const ManageUserPage = lazy(() => import('pages/admin/manage.user'));
const ManageCategoryPage = lazy(() => import('@/pages/admin/manage.category'));
const ManageRatingPage = lazy(() => import('@/pages/admin/manage.rating'));
const AdminChatWebSocket = lazy(() => import('@/components/admin/websocket/admin.chat'));

// Fallback hiển thị trong lúc chunk của route đang được tải.
// Viết inline thay vì tách thành component để main.tsx không vi phạm
// quy tắc react-refresh (file entry không export gì).
const withSuspense = (element: ReactNode) => (
  <Suspense
    fallback={
      <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
        <Spin size="large" />
      </div>
    }
  >
    {element}
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: withSuspense(<HomePage />) },
      { path: "/books", element: withSuspense(<BookPage />) },
      { path: "/books/:id", element: withSuspense(<BookDetailPage />) },
      {
        path: "/order-history",
        element: withSuspense(
          <ProtectedRoute>
            <OrderPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/checkout",
        element: withSuspense(
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      { path: "/checkout/fail", element: withSuspense(<CheckoutFail />) },
      {
        path: "/profile",
        element: withSuspense(
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      { path: "/about", element: withSuspense(<AboutPage />) },
    ],
  },
  {
    path: "admin",
    element: withSuspense(
      <ProtectedRoute requireAdmin>
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: withSuspense(<DashBoardPage />) },
      { path: "category", element: withSuspense(<ManageCategoryPage />) },
      { path: "book", element: withSuspense(<ManageBookPage />) },
      { path: "order", element: withSuspense(<ManageOrderPage />) },
      { path: "rating", element: withSuspense(<ManageRatingPage />) },
      { path: "user", element: withSuspense(<ManageUserPage />) },
      { path: "chat", element: withSuspense(<AdminChatWebSocket />) },
    ]
  },
  { path: "/login", element: withSuspense(<LoginPage />) },
  { path: "/register", element: withSuspense(<RegisterPage />) },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* ThemeProvider phải nằm NGOÀI ThemedConfigProvider: nó quyết định chế độ
        sáng/tối mà ThemedConfigProvider đọc để dựng theme cho Ant Design */}
    <ThemeProvider>
      <App>
        <AuthProvider>
          {/* ThemedConfigProvider đồng bộ màu/bo góc/font của Ant Design với
              design token trong SCSS, đồng thời đổi locale (vi_VN / en_US) và
              chế độ sáng/tối theo lựa chọn của người dùng */}
          <ThemedConfigProvider area="client">
            <RouterProvider router={router} />
          </ThemedConfigProvider>
        </AuthProvider>
      </App>
    </ThemeProvider>
  </StrictMode>,
)
