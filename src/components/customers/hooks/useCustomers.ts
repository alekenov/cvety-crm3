// useCustomers Hook
// Extracted from Customers.tsx for better organization

import { useState, useEffect } from 'react';
import { CustomerAPI, Customer } from '../../../services/customerApi';
// Import performance utilities
import { trackApiCall } from '../../../utils/performance';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loadedFromCache, setLoadedFromCache] = useState(false);
  
  // Load customers from API
  const loadCustomers = async (showLoadingState = true) => {
    if (showLoadingState) {
      setLoading(true);
    }
    setError(null);
    
    try {
      console.log('🔍 Loading customers from API...');
      const startTime = Date.now();
      
      // Use the new optimized endpoint that includes aggregated statistics
      let result;
      try {
        const { customers: customersData } = await CustomerAPI.getCustomersWithStats(1, 100, false);
        result = customersData;
      } catch (error) {
        console.warn('⚠️ New endpoint failed, falling back to legacy method:', error);
        result = await CustomerAPI.fetchCustomers(100, 0, true);
      }
      
      // Track API performance
      const duration = Date.now() - startTime;
      trackApiCall('customers-load', duration, true);
      
      console.log(`✅ Loaded ${result.length} customers successfully in ${duration}ms`);
      setCustomers(result);
      setLoadedFromCache(false);
      
    } catch (err) {
      console.error('❌ Failed to load customers:', err);
      setError('Не удалось загрузить клиентов');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadCustomers();
  }, []);

  // Filter customers based on search and active filter
  const filteredCustomers = customers.filter(customer => {
    // Apply search filter
    const matchesSearch = searchQuery === '' || 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);
    
    // Apply status filter
    let matchesFilter = true;
    switch (activeFilter) {
      case 'active':
        matchesFilter = customer.status === 'active';
        break;
      case 'vip':
        matchesFilter = customer.status === 'vip';
        break;
      case 'inactive':
        matchesFilter = customer.status === 'inactive';
        break;
      default:
        matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
  });

  // Calculate statistics
  const stats = {
    total: customers.length,
    vip: customers.filter(c => c.status === 'vip').length,
    active: customers.filter(c => c.status === 'active').length,
    inactive: customers.filter(c => c.status === 'inactive').length
  };

  // Generate filter tabs with counts
  const filterTabs = [
    { key: 'all', label: 'Все', count: stats.total },
    { key: 'active', label: 'Активные', count: stats.active },
    { key: 'vip', label: 'VIP', count: stats.vip },
    { key: 'inactive', label: 'Неактивные', count: stats.inactive }
  ];

  return {
    customers: filteredCustomers,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    stats,
    filterTabs,
    loadedFromCache,
    refreshCustomers: () => loadCustomers(false)
  };
}