import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import App from "./App";

const OrderDetailPage = lazy(() => import("./pages/OrderDetailPage"));
const CustomerDetailPage = lazy(() => import("./pages/CustomerDetailPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Загрузка...</p>
    </div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/products",
    element: <App />,
  },
  {
    path: "/products/:id",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProductDetailPage />
      </Suspense>
    ),
  },
  {
    path: "/orders",
    element: <App />,
  },
  {
    path: "/orders/:id",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <OrderDetailPage />
      </Suspense>
    ),
  },
  {
    path: "/inventory",
    element: <App />,
  },
  {
    path: "/customers",
    element: <App />,
  },
  {
    path: "/customers/:id",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <CustomerDetailPage />
      </Suspense>
    ),
  },
  {
    path: "/profile",
    element: <App />,
  },
]);