import { EditCatalogForm } from "../components/EditCatalogForm";

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

interface EditCatalogFormPageProps {
  product: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

export function EditCatalogFormPage(props: EditCatalogFormPageProps) {
  return <EditCatalogForm {...props} />;
}