import { api } from './client';
import { getTimeAgo } from '../utils/date';
import { decodeHtmlEntities, formatPrice } from '../utils/format';

export type FrontStatus = 'new'|'paid'|'accepted'|'assembled'|'in-transit'|'completed';
const front2bx: Record<FrontStatus,string> = { new:'N', paid:'PD', accepted:'AP', assembled:'CO', 'in-transit':'DE', completed:'F' };
const bx2front: Record<string,FrontStatus> = { N:'new', PD:'paid', AP:'accepted', CO:'assembled', DE:'in-transit', F:'completed' };

// Order types matching original design
export interface Order {
  id: string;
  number: string;
  status: FrontStatus;
  deliveryType: 'delivery' | 'pickup';
  deliveryCity: string;
  deliveryAddress: string;
  deliveryDate: 'today' | 'tomorrow' | string;
  deliveryTime: string;
  mainProduct: {
    id: string;
    image: string;
    title: string;
    composition?: string;
  };
  additionalItems?: Array<{
    productId: string;
    productImage: string;
    productTitle: string;
    quantity: number;
  }>;
  recipient: {
    name: string;
    phone: string;
  };
  sender: {
    name: string;
    phone: string;
    email?: string;
  };
  postcard?: string;
  comment?: string;
  anonymous: boolean;
  payment: {
    amount: string;
    status: 'paid' | 'unpaid';
    method?: string;
  };
  executor?: {
    florist?: string;
    courier?: string;
  };
  photoBeforeDelivery?: string;
  history: Array<{
    date: string;
    description: string;
  }>;
  createdAt: string;
  updatedAt?: string;
}

export async function fetchOrders(params: { status?: FrontStatus; date?: string; limit?: number; offset?: number }) {
  const limit = params.limit || 30;
  const offset = params.offset || 0;
  try {
    // Use new normalized endpoint
    const response = await api('/api/v2/orders', {
      query: {
        limit,
        offset,
        ...(params.status && params.status !== 'all' ? { status: front2bx[params.status] } : {})
      }
    });

    if (response && response.success === true && Array.isArray(response.data)) {
      const mapped: Order[] = response.data.map((o: any) => ({
        id: String(o.id),
        number: String(o.number || o.id),
        status: (o.status as FrontStatus) || (bx2front[o.status_id] || 'new'),
        deliveryType: 'delivery',
        deliveryCity: o.deliveryCity || '',
        deliveryAddress: o.deliveryAddressShort || '',
        deliveryDate: 'today',
        deliveryTime: o.deliveryTime || '',
        mainProduct: {
          id: String(o.id),
          image: o.mainImage || '',
          title: 'Товар',
          composition: ''
        },
        additionalItems: [],
        recipient: { name: o.recipientMasked || '', phone: o.recipientPhoneMasked || '' },
        sender: { name: '', phone: '' },
        postcard: '',
        comment: '',
        anonymous: false,
        payment: {
          amount: o.paymentAmount || '0 ₸',
          status: (o.paymentStatus === 'Оплачен' ? 'paid' : 'unpaid') as 'paid'|'unpaid'
        },
        executor: (o.executors && o.executors[0]) ? { florist: o.executors[0].name, courier: '' } : undefined,
        photoBeforeDelivery: undefined,
        history: [],
        createdAt: o.createdAt || new Date().toISOString(),
        updatedAt: undefined
      }));

      const filtered = params.status && params.status !== 'all'
        ? mapped.filter(m => m.status === params.status)
        : mapped;

      return {
        success: true,
        data: filtered,
        pagination: {
          total: (response.pagination?.total as number) || filtered.length,
          limit,
          offset,
          hasMore: !!response.pagination?.hasMore
        }
      };
    }

    // Fallback to legacy mapping if new endpoint is unavailable
    if (response && response.status === true && response.data?.orders) {
      const orders = response.data.orders.map(transformLegacyOrderFromAPI);
      const filteredOrders = params.status && params.status !== 'all'
        ? orders.filter((o: Order) => o.status === params.status)
        : orders;
      return {
        success: true,
        data: filteredOrders,
        pagination: { total: filteredOrders.length, limit, offset, hasMore: false }
      };
    }

    return { success: false, data: [], pagination: { total: 0, limit, offset, hasMore: false } };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { success: false, data: [], pagination: { total: 0, limit, offset, hasMore: false } };
  }
}

// Transform legacy API order to frontend format
function transformLegacyOrderFromAPI(order: any): Order {
  // Map status
  const status = bx2front[order.status_id] || 'new';
  
  // Build main product from basket
  const mainProduct = order.basket?.[0] ? {
    id: String(order.basket[0].id),
    image: order.basket[0].productImageSrc ? 
      `${order.basket[0].productImageSrc}` : 
      (order.productImage ? `${order.productImage}` : ''),
    title: order.basket[0].productName || order.productName || 'Товар',
    composition: ''
  } : {
    id: String(order.id),
    image: order.productImage ? `${order.productImage}` : '',
    title: order.productName || 'Товар',
    composition: ''
  };
  
  // Build additional items from rest of basket
  const additionalItems = order.basket?.slice(1).map((item: any) => ({
    productId: String(item.id),
    productImage: item.productImageSrc ? `${item.productImageSrc}` : '',
    productTitle: item.productName || '',
    quantity: item.amount || 1
  })) || [];
  
  // Format delivery date
  const formatDeliveryDate = (dateStr: string) => {
    if (!dateStr) return 'today';
    const today = new Date();
    const orderDate = new Date(dateStr);
    const diffDays = Math.floor((orderDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'tomorrow';
    return dateStr;
  };
  
  return {
    id: String(order.id),
    number: String(order.id),
    status: status,
    deliveryType: order.iWillGet ? 'pickup' : 'delivery',
    deliveryCity: order.city || 'Город не указан',
    deliveryAddress: order.address || order.addressRecipient || order.street || '',
    deliveryDate: formatDeliveryDate(order.data),
    deliveryTime: order.deliveryName || order.planDeliveryTime || '',
    mainProduct: mainProduct,
    additionalItems: additionalItems,
    recipient: {
      name: order.nameRecipient || '',
      phone: order.phoneRecipient || order.phone || ''
    },
    sender: {
      name: '',
      phone: order.phone || '',
      email: order.email || ''
    },
    postcard: '',
    comment: order.comment || order.commentCourier || '',
    anonymous: false,
    payment: {
      amount: formatPrice(decodeHtmlEntities(order.price_formated || order.full_price_formatted || '0')),
      status: order.payed === 'Y' ? 'paid' : 'unpaid',
      method: null
    },
    executor: order.responsibleName ? { 
      florist: order.responsibleName 
    } : undefined,
    photoBeforeDelivery: order.recipientPhoto || undefined,
    history: [],
    createdAt: order.createdAt || new Date().toISOString()
  };
}

export async function fetchOrderDetail(id: string|number) {
  // Use the enhanced detail endpoint
  const response = await api('/api/v2/orders/detail/', { query: { id } });
  
  if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
    return {
      success: response.success,
      data: transformOrderFromAPI(response.data)
    };
  }
  
  return {
    success: true,
    data: transformOrderFromAPI(response)
  };
}

// Transform new API order to frontend format (for detail view)
function transformOrderFromAPI(order: any): Order {
  const isListFormat = 'paymentAmount' in order;
  
  if (isListFormat) {
    // Should not happen for detail view
    return transformLegacyOrderFromAPI(order);
  } else {
    // Detail format
    return {
      id: String(order.id),
      number: order.number || String(order.id),
      status: order.status || 'new',
      deliveryType: order.deliveryType || 'delivery',
      deliveryCity: order.deliveryCity || 'Город не указан',
      deliveryAddress: order.deliveryAddress || '',
      deliveryDate: order.deliveryDate || 'today',
      deliveryTime: order.deliveryTime || '',
      mainProduct: order.selectedProduct || {
        id: String(order.id),
        image: '',
        title: 'Товар',
        composition: ''
      },
      additionalItems: order.additionalItems || [],
      recipient: order.recipient || { name: '', phone: '' },
      sender: order.sender || { name: '', phone: '', email: '' },
      postcard: order.postcard || '',
      comment: order.comment || '',
      anonymous: order.anonymous || false,
      payment: order.payment || { amount: '0 ₸', status: 'unpaid' },
      executor: order.executor,
      photoBeforeDelivery: order.photoBeforeDelivery,
      history: order.history || [],
      createdAt: order.createdAt || new Date().toISOString(),
      updatedAt: order.updatedAt
    };
  }
}

export async function fetchAllowedStatuses(id: string|number) {
  const res = await api('/api/v2/order/allowed-statuses', { query: { id } });
  return res as { status:true; data:{ id:number; current:string; allowed:string[] } };
}

export async function changeOrderStatus(id: string|number, status: FrontStatus, comment?: string) {
  const body = { id, statusId: front2bx[status], ...(comment? { comment }: {}) };
  const res = await api('/api/v2/order/change-status', { method:'POST', body });
  return res as { status:true; data:any };
}

export async function deleteOrder(id: string|number) {
  const res = await api('/api/v2/orders/delete', { method:'DELETE', query: { id } });
  return res as { success:true; data:any };
}
