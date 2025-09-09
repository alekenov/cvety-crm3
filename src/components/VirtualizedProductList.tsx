import React from 'react';
// @ts-ignore - react-window has export issues with types  
import * as ReactWindow from 'react-window';
const List = ReactWindow.FixedSizeList;
import { Product } from '../src/types';

interface VirtualizedProductListProps {
  products: Product[];
  itemHeight: number;
  height: number;
  onToggle: (id: number) => void;
  onView: (id: number) => void;
  searchQuery?: string;
  ItemComponent: React.ComponentType<Product & {
    onToggle: (id: number) => void;
    onView: (id: number) => void;
    searchQuery?: string;
  }>;
}

interface ListItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    products: Product[];
    onToggle: (id: number) => void;
    onView: (id: number) => void;
    searchQuery?: string;
    ItemComponent: VirtualizedProductListProps['ItemComponent'];
  };
}

const ListItem: React.FC<ListItemProps> = ({ index, style, data }) => {
  const { products, onToggle, onView, searchQuery, ItemComponent } = data;
  const product = products[index];
  
  if (!product) return null;

  return (
    <div style={style}>
      <ItemComponent
        {...product}
        onToggle={onToggle}
        onView={onView}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export const VirtualizedProductList: React.FC<VirtualizedProductListProps> = ({
  products,
  itemHeight,
  height,
  onToggle,
  onView,
  searchQuery,
  ItemComponent
}) => {
  // Memoize item data to prevent re-renders
  const itemData = React.useMemo(() => ({
    products,
    onToggle,
    onView,
    searchQuery,
    ItemComponent
  }), [products, onToggle, onView, searchQuery, ItemComponent]);

  if (products.length === 0) {
    return null;
  }

  return (
    <List
      height={height}
      itemCount={products.length}
      itemSize={itemHeight}
      itemData={itemData}
      overscanCount={5} // Render 5 extra items for smooth scrolling
    >
      {ListItem}
    </List>
  );
};

// Hook to calculate optimal virtualization settings
export const useVirtualization = (itemCount: number, containerHeight: number = 600) => {
  const ITEM_HEIGHT = 120; // Height of each ProductItem
  const shouldVirtualize = itemCount > 20; // Virtualize if more than 20 items
  
  return {
    shouldVirtualize,
    itemHeight: ITEM_HEIGHT,
    height: Math.min(containerHeight, itemCount * ITEM_HEIGHT),
    visibleItems: Math.ceil(containerHeight / ITEM_HEIGHT)
  };
};