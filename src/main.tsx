import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { App, ConfigProvider } from 'antd';
import { AuthProvider } from '@/components/context/app.context';

import Layout from '@/layout';
import AdminLayout from 'components/layout/admin.layout';

import BookPage from '@/pages/client/client.book';
import HomePage from 'pages/client/home';
import AboutPage from 'pages/client/about';
import CheckoutPage from 'pages/client/checkout';

import LoginPage from 'pages/auth/login';
import RegisterPage from 'pages/auth/register';
import ErrorPage from 'pages/not-found/error';

import DashBoardPage from '@/pages/admin/dashboard';
import ManageBookPage from 'pages/admin/manage.book';
import ManageOrderPage from 'pages/admin/manage.order';
import ManageUserPage from 'pages/admin/manage.user';
import ProtectedRoute from 'components/auth/private.route';

import enUS from 'antd/locale/en_US';
// import viVN from 'antd/locale/vi_VN';

import "styles/global.scss";
import CartPage from 'pages/client/cart';
import ProfilePage from 'pages/client/profile';
import OrderPage from 'pages/client/client.order';
import BookDetailPage from '@/pages/client/book/item';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/books",
        element: <BookPage />,
      },
      {
        path: "/books/:id",
        element: <BookDetailPage />,
      },
      {
        path: "/order",
        element: (
          <ProtectedRoute>
            <OrderPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/cart",
        element: (
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/checkout",
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/about",
        element: <AboutPage />,
      },
    ],
  },
  {
    path: "admin",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <DashBoardPage />,
      },
      {
        path: "book",
        element: <ManageBookPage />,
      },
      {
        path: "order",
        element: <ManageOrderPage />,
      },
      {
        path: "user",
        element: <ManageUserPage />,
      },
    ]
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App>
      <AuthProvider>
        <ConfigProvider locale={enUS}>
          <RouterProvider router={router} />
        </ConfigProvider>
      </AuthProvider>
    </App>
  </StrictMode>,
)


