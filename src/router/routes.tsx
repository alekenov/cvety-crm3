import React, { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';

// Lazy load components for better performance
const MainLayout = lazy(() => import('../layouts/MainLayout'));
const ProductsList = lazy(() => import('../components/ProductsList'));
const ProductTypeSelector = lazy(() => import('../components/ProductTypeSelector'));

// These components need wrappers because they export named functions
const AddProductForm = lazy(() => import('../components/wrappers/ProductsWrapper').then(m => ({ default: m.AddProductForm })));
const AddCatalogForm = lazy(() => import('../components/wrappers/ProductsWrapper').then(m => ({ default: m.AddCatalogForm })));
const ProductDetail = lazy(() => import('../components/wrappers/ProductsWrapper').then(m => ({ default: m.ProductDetail })));
const EditCatalogForm = lazy(() => import('../components/wrappers/ProductsWrapper').then(m => ({ default: m.EditCatalogForm })));

// Orders components with real API
const Orders = lazy(() => import('../components/OrdersList'));
const OrderDetail = lazy(() => import('../components/OrderDetailView'));
const AddOrder = lazy(() => import('../components/stubs/StubComponents').then(m => ({ default: m.AddOrder })));
const Inventory = lazy(() => import('../components/stubs/StubComponents').then(m => ({ default: m.Inventory })));
const AddInventoryItem = lazy(() => import('../components/stubs/StubComponents').then(m => ({ default: m.AddInventoryItem })));
const InventoryItemDetail = lazy(() => import('../components/stubs/StubComponents').then(m => ({ default: m.InventoryItemDetail })));
const InventoryAudit = lazy(() => import('../components/stubs/StubComponents').then(m => ({ default: m.InventoryAudit })));
const Customers = lazy(() => import('../components/stubs/StubComponents').then(m => ({ default: m.Customers })));
const CustomerDetail = lazy(() => import('../components/stubs/StubComponents').then(m => ({ default: m.CustomerDetail })));
const AddCustomer = lazy(() => import('../components/stubs/StubComponents').then(m => ({ default: m.AddCustomer })));
const Profile = lazy(() => import('../components/stubs/StubComponents').then(m => ({ default: m.Profile })));
const Dashboard = lazy(() => import('../components/stubs/StubComponents').then(m => ({ default: m.Dashboard })));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Загрузка...</p>
    </div>
  </div>
);

// Wrapper for lazy loaded components
const LazyWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
);

export const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <LazyWrapper>
        <MainLayout />
      </LazyWrapper>
    ),
    children: [
      {
        index: true,
        element: (
          <LazyWrapper>
            <ProductsList />
          </LazyWrapper>
        ),
      },
      {
        path: 'products',
        children: [
          {
            index: true,
            element: (
              <LazyWrapper>
                <ProductsList />
              </LazyWrapper>
            ),
          },
          {
            path: 'add',
            element: (
              <LazyWrapper>
                <ProductTypeSelector />
              </LazyWrapper>
            ),
          },
          {
            path: 'add/vitrina',
            element: (
              <LazyWrapper>
                <AddProductForm />
              </LazyWrapper>
            ),
          },
          {
            path: 'add/catalog',
            element: (
              <LazyWrapper>
                <AddCatalogForm />
              </LazyWrapper>
            ),
          },
          {
            path: ':id',
            element: (
              <LazyWrapper>
                <ProductDetail />
              </LazyWrapper>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <LazyWrapper>
                <EditCatalogForm />
              </LazyWrapper>
            ),
          },
        ],
      },
      {
        path: 'orders',
        children: [
          {
            index: true,
            element: (
              <LazyWrapper>
                <Orders />
              </LazyWrapper>
            ),
          },
          {
            path: 'add',
            element: (
              <LazyWrapper>
                <AddOrder />
              </LazyWrapper>
            ),
          },
          {
            path: ':id',
            element: (
              <LazyWrapper>
                <OrderDetail />
              </LazyWrapper>
            ),
          },
        ],
      },
      {
        path: 'inventory',
        children: [
          {
            index: true,
            element: (
              <LazyWrapper>
                <Inventory />
              </LazyWrapper>
            ),
          },
          {
            path: 'supply',
            element: (
              <LazyWrapper>
                <AddInventoryItem />
              </LazyWrapper>
            ),
          },
          {
            path: 'audit',
            element: (
              <LazyWrapper>
                <InventoryAudit />
              </LazyWrapper>
            ),
          },
          {
            path: ':id',
            element: (
              <LazyWrapper>
                <InventoryItemDetail />
              </LazyWrapper>
            ),
          },
        ],
      },
      {
        path: 'customers',
        children: [
          {
            index: true,
            element: (
              <LazyWrapper>
                <Customers />
              </LazyWrapper>
            ),
          },
          {
            path: 'add',
            element: (
              <LazyWrapper>
                <AddCustomer />
              </LazyWrapper>
            ),
          },
          {
            path: ':id',
            element: (
              <LazyWrapper>
                <CustomerDetail />
              </LazyWrapper>
            ),
          },
        ],
      },
      {
        path: 'profile',
        element: (
          <LazyWrapper>
            <Profile />
          </LazyWrapper>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <LazyWrapper>
            <Dashboard />
          </LazyWrapper>
        ),
      },
    ],
  },
];