import { ProductTypeSelector } from "../components/ProductTypeSelector";

interface ProductTypeSelectPageProps {
  onSelectVitrina: () => void;
  onSelectCatalog: () => void;
  onBack: () => void;
}

export function ProductTypeSelectPage(props: ProductTypeSelectPageProps) {
  return <ProductTypeSelector {...props} />;
}