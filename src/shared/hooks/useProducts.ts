import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchProducts, toggleProductActive, fetchProductDetail } from '@/api/products';
import type { ProductDTO } from '@/api/products';

// Query key factory
const productsKeys = {
  all: ['products'] as const,
  lists: () => [...productsKeys.all, 'list'] as const,
  list: (filters: Parameters<typeof fetchProducts>[0]) => [...productsKeys.lists(), filters] as const,
  details: () => [...productsKeys.all, 'detail'] as const,
  detail: (id: number) => [...productsKeys.details(), id] as const,
};

// Products list hook
export function useProducts(filters: Parameters<typeof fetchProducts>[0] = {}) {
  return useQuery({
    queryKey: productsKeys.list(filters),
    queryFn: () => fetchProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => ({
      ...data,
      // Transform createdAt strings to Date objects for UI
      data: data.data.map(product => ({
        ...product,
        createdAt: product.createdAt ? new Date(product.createdAt) : new Date()
      }))
    }),
  });
}

// Product detail hook
export function useProduct(id: number | null) {
  return useQuery({
    queryKey: productsKeys.detail(id!),
    queryFn: () => fetchProductDetail(id!),
    enabled: id !== null,
    staleTime: 2 * 60 * 1000, // 2 minutes for detail view
    select: (data) => ({
      ...data,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date()
    }),
  });
}

// Toggle product status mutation
export function useToggleProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => toggleProductActive(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: productsKeys.all });

      // Optimistic update
      queryClient.setQueriesData(
        { queryKey: productsKeys.lists() },
        (oldData: any) => {
          if (!oldData?.data) return oldData;
          
          return {
            ...oldData,
            data: oldData.data.map((product: ProductDTO) =>
              product.id === id 
                ? { ...product, isAvailable: !product.isAvailable }
                : product
            )
          };
        }
      );

      // Return context for rollback
      const previousData = queryClient.getQueryData(productsKeys.lists());
      return { previousData };
    },
    onError: (error, id, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueriesData(
          { queryKey: productsKeys.lists() },
          context.previousData
        );
      }
      
      toast.error('Не удалось изменить статус товара');
    },
    onSuccess: (data, id) => {
      // Update all related queries
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
      
      toast.success('Статус товара обновлен');
    },
  });
}

// Create/Update product mutations
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: Partial<ProductDTO>) => {
      // Use existing API when create method is available
      // For now, return mock success
      return Promise.resolve({ success: true, data: productData as ProductDTO });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
      toast.success('Товар создан успешно');
    },
    onError: () => {
      toast.error('Не удалось создать товар');
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...updates }: { id: number } & Partial<ProductDTO>) => {
      // Use existing API when update method is available
      // For now, return mock success
      return Promise.resolve({ success: true, data: { id, ...updates } as ProductDTO });
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: productsKeys.detail(id) });

      // Optimistic update for detail view
      queryClient.setQueryData(
        productsKeys.detail(id),
        (oldData: ProductDTO | undefined) => oldData ? { ...oldData, ...updates } : undefined
      );

      const previousData = queryClient.getQueryData(productsKeys.detail(id));
      return { previousData };
    },
    onError: (error, { id }, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(productsKeys.detail(id), context.previousData);
      }
      toast.error('Не удалось обновить товар');
    },
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
      toast.success('Товар обновлен успешно');
    },
  });
}

// Export query keys for external use
export { productsKeys };