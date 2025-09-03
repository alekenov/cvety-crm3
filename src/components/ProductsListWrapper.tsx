import ProductsList from './ProductsList';

interface ProductsListWrapperProps {
  products: any[];
  onAddProduct: () => void;
  onViewProduct: (id: number) => void;
  onToggleProduct: (id: number) => void;
}

// This wrapper component bridges the MainTabView interface with ProductsList
export default function ProductsListWrapper(props: ProductsListWrapperProps) {
  // ProductsList manages its own state and routing internally
  // We just render it without passing props since it uses context
  return <ProductsList />;
}