import { ProductDetail } from "../components/ProductDetail";

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

interface ProductDetailPageProps {
  product: Product;
  onEdit: (id: number) => void;
  onBack: () => void;
  onToggle: (id: number) => void;
}

export function ProductDetailPage(props: ProductDetailPageProps) {
  return <ProductDetail {...props} />;
}