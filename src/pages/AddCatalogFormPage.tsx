import { AddCatalogForm } from "../components/AddCatalogForm";

interface Product {
  id: number;
  image: string;
  images?: string[];
  title: string;
  price: string;
  isAvailable: boolean;
  createdAt: Date;
  type: 'vitrina' | 'catalog';
  width?: string;
  height?: string;
  video?: string;
  duration?: string;
  discount?: string;
  composition?: Array<{ name: string; count: string }>;
  colors?: string[];
  catalogWidth?: string;
  catalogHeight?: string;
  productionTime?: string;
}

interface AddCatalogFormPageProps {
  onSave: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function AddCatalogFormPage(props: AddCatalogFormPageProps) {
  return <AddCatalogForm {...props} />;
}