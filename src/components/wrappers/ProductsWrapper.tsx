// Wrapper components for routing
// These provide default exports and handle routing logic

export { default as ProductsList } from '../ProductsList';
export { default as ProductTypeSelector } from '../ProductTypeSelector';

// For components with named exports, we need to wrap them
import { AddProductForm as AddProductFormOriginal } from '../AddProductForm';
import { AddCatalogForm as AddCatalogFormOriginal } from '../AddCatalogForm';
import { ProductDetail as ProductDetailOriginal } from '../ProductDetail';
import { EditCatalogForm as EditCatalogFormOriginal } from '../EditCatalogForm';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../../src/contexts/AppContext';
import { useAppActions } from '../../src/hooks/useAppActions';

export function AddProductForm() {
  const navigate = useNavigate();
  const handleClose = () => navigate('/products');
  return <AddProductFormOriginal onClose={handleClose} />;
}

export function AddCatalogForm() {
  const navigate = useNavigate();
  const handleClose = () => navigate('/products');
  return <AddCatalogFormOriginal onClose={handleClose} />;
}

export function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const state = useAppContext();
  const actions = useAppActions({
    setCurrentScreen: state.setCurrentScreen,
    navigateToScreen: state.navigateToScreen,
    navigateBack: state.navigateBack,
    setActiveTab: state.setActiveTab,
    setSelectedProductId: state.setSelectedProductId,
    setSelectedOrderId: state.setSelectedOrderId,
    setSelectedInventoryItemId: state.setSelectedInventoryItemId,
    setSelectedCustomerId: state.setSelectedCustomerId,
    setProducts: state.setProducts,
    setOrders: state.setOrders,
    setCustomers: state.setCustomers,
    products: state.products,
    customers: state.customers
  });
  
  const productId = parseInt(id || '0');
  const handleClose = () => navigate('/products');
  const handleEdit = () => navigate(`/products/${id}/edit`);
  
  return (
    <ProductDetailOriginal 
      productId={productId}
      products={state.products}
      onClose={handleClose}
      onUpdateProduct={actions.updateProduct}
      onEditProduct={handleEdit}
    />
  );
}

export function EditCatalogForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const state = useAppContext();
  const actions = useAppActions({
    setCurrentScreen: state.setCurrentScreen,
    navigateToScreen: state.navigateToScreen,
    navigateBack: state.navigateBack,
    setActiveTab: state.setActiveTab,
    setSelectedProductId: state.setSelectedProductId,
    setSelectedOrderId: state.setSelectedOrderId,
    setSelectedInventoryItemId: state.setSelectedInventoryItemId,
    setSelectedCustomerId: state.setSelectedCustomerId,
    setProducts: state.setProducts,
    setOrders: state.setOrders,
    setCustomers: state.setCustomers,
    products: state.products,
    customers: state.customers
  });
  
  const productId = parseInt(id || '0');
  const handleClose = () => navigate('/products');
  
  return (
    <EditCatalogFormOriginal 
      productId={productId}
      products={state.products}
      onClose={handleClose}
      onUpdateProduct={actions.updateProduct}
    />
  );
}