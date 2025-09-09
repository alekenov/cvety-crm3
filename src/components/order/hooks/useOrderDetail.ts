// Order Detail Hook
// Extracted from OrderDetail.tsx for better organization

import { useState, useEffect } from 'react';
import { fetchOrderDetail, changeOrderStatus, type Order, type FrontStatus } from '../../../api/orders';

export interface EditableOrderData {
  postcard: string;
  comment: string;
  address: string;
  deliveryDate: string;
  recipientName: string;
  recipientPhone: string;
  senderName: string;
  senderPhone: string;
  senderEmail: string;
}

export function useOrderDetail(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<FrontStatus>('new');
  const [isEditing, setIsEditing] = useState(false);

  // Редактируемые поля
  const [editableData, setEditableData] = useState<EditableOrderData>({
    postcard: '',
    comment: '',
    address: '',
    deliveryDate: '',
    recipientName: '',
    recipientPhone: '',
    senderName: '',
    senderPhone: '',
    senderEmail: ''
  });

  // Map status from API to Russian display text
  const getStatusDisplay = (status: FrontStatus): string => {
    const statusMap = {
      'new': 'Новый',
      'paid': 'Оплачен',
      'accepted': 'Принят',
      'assembled': 'Собран',
      'in-transit': 'В пути',
      'completed': 'Завершен'
    };
    return statusMap[status] || status;
  };

  // Load order data from API
  useEffect(() => {
    const loadOrder = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await fetchOrderDetail(orderId);
        if (result.success && result.data) {
          setOrder(result.data);
          setCurrentStatus(result.data.status);
          
          // Initialize editable data with real order data
          setEditableData({
            postcard: result.data.postcard || '',
            comment: result.data.comment || '',
            address: result.data.deliveryAddress || '',
            deliveryDate: `${result.data.deliveryDate === 'today' ? 'Сегодня' : result.data.deliveryDate === 'tomorrow' ? 'Завтра' : result.data.deliveryDate}, ${result.data.deliveryTime || 'время не указано'}`,
            recipientName: result.data.recipient.name || '',
            recipientPhone: result.data.recipient.phone || '',
            senderName: result.data.sender.name || '',
            senderPhone: result.data.sender.phone || '',
            senderEmail: result.data.sender.email || ''
          });
        } else {
          setError('Не удалось загрузить заказ');
        }
      } catch (err) {
        console.error('Failed to load order:', err);
        setError('Ошибка при загрузке заказа');
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const handleStatusUpdate = async (newStatusRu: string) => {
    try {
      const ru2front: Record<string, FrontStatus> = {
        'Новый': 'new',
        'Оплачен': 'paid',
        'Принят': 'accepted',
        'Собран': 'assembled',
        'В пути': 'in-transit',
        'Завершен': 'completed',
      };
      const next = ru2front[newStatusRu] || 'new';
      if (!order) return;
      await changeOrderStatus(order.id, next);
      setCurrentStatus(next);
      // Reflect in local order state
      setOrder({ ...order, status: next });
    } catch (e) {
      console.error('Failed to update order status:', e);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes logic here
      console.log('Saving changes:', editableData);
      // TODO: Implement API call to save changes
    }
    setIsEditing(!isEditing);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset to original values if needed
    if (order) {
      setEditableData({
        postcard: order.postcard || '',
        comment: order.comment || '',
        address: order.deliveryAddress || '',
        deliveryDate: `${order.deliveryDate === 'today' ? 'Сегодня' : order.deliveryDate === 'tomorrow' ? 'Завтра' : order.deliveryDate}, ${order.deliveryTime || 'время не указано'}`,
        recipientName: order.recipient.name || '',
        recipientPhone: order.recipient.phone || '',
        senderName: order.sender.name || '',
        senderPhone: order.sender.phone || '',
        senderEmail: order.sender.email || ''
      });
    }
  };

  return {
    order,
    isLoading,
    error,
    currentStatus,
    isEditing,
    editableData,
    setEditableData,
    getStatusDisplay,
    handleStatusUpdate,
    handleEditToggle,
    handleCancelEdit
  };
}
