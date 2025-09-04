#!/usr/bin/env node

// Test script to explore all cvety.kz API v2 endpoints
// Token from production config
const API_TOKEN = 'ABE7142D-D8AB-76AF-8D6C-2C4FAEA9B144';
const BASE_URL = 'https://cvety.kz';

// Helper function to make API calls
async function testEndpoint(method, path, body = null, contentType = 'application/json') {
    const url = `${BASE_URL}${path}${path.includes('?') ? '&' : '?'}access_token=${API_TOKEN}`;
    
    const options = {
        method,
        headers: {
            'Accept': 'application/json',
        }
    };
    
    if (body) {
        if (contentType === 'application/json') {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        } else if (contentType === 'form') {
            options.body = new URLSearchParams(body);
        }
    }
    
    try {
        console.log(`\n🔍 Testing: ${method} ${path}`);
        const response = await fetch(url, options);
        const text = await response.text();
        
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }
        
        console.log(`   Status: ${response.status} ${response.statusText}`);
        console.log(`   Response:`, JSON.stringify(data, null, 2).substring(0, 500) + '...');
        
        return { success: response.ok, status: response.status, data };
    } catch (error) {
        console.log(`   ❌ Error:`, error.message);
        return { success: false, error: error.message };
    }
}

// Test all endpoints
async function testAllEndpoints() {
    console.log('🚀 Testing cvety.kz API v2 endpoints...\n');
    console.log(`Token: ${API_TOKEN.substring(0, 8)}...`);
    console.log(`Base URL: ${BASE_URL}`);
    
    const results = {};
    
    // 1. PRODUCTS
    console.log('\n📦 === PRODUCTS ENDPOINTS ===');
    
    results.products_list = await testEndpoint('GET', '/api/v2/products', null);
    results.products_list_vitrina = await testEndpoint('GET', '/api/v2/products?type=vitrina&limit=5', null);
    results.products_list_catalog = await testEndpoint('GET', '/api/v2/products?type=catalog&limit=5', null);
    
    // Get a product ID from the first result
    let productId = null;
    if (results.products_list.success && results.products_list.data?.data?.length > 0) {
        productId = results.products_list.data.data[0].id;
        console.log(`   Using product ID: ${productId} for detail test`);
        results.products_detail = await testEndpoint('GET', `/api/v2/products/detail?id=${productId}`, null);
    }
    
    // Legacy product endpoint
    results.products_legacy = await testEndpoint('GET', '/api/v2/product/list/?type=vitrina&limit=3', null);
    
    // Product management endpoints (use first product ID if available)
    if (productId) {
        results.product_update_status = await testEndpoint('POST', '/api/v2/product/update-status', 
            { id: productId, active: 'Y' });
        results.product_properties = await testEndpoint('POST', '/api/v2/product/properties', 
            { id: productId, width: 25, height: 40 });
    }
    
    // 2. ORDERS
    console.log('\n📋 === ORDERS ENDPOINTS ===');
    
    results.orders_list = await testEndpoint('GET', '/api/v2/orders?limit=5', null);
    results.orders_legacy = await testEndpoint('GET', '/api/v2/order/order-list?limit=3', null);
    
    // Get order ID from results
    let orderId = null;
    if (results.orders_list.success && results.orders_list.data?.data?.length > 0) {
        orderId = results.orders_list.data.data[0].id;
        console.log(`   Using order ID: ${orderId} for detail test`);
        results.orders_detail = await testEndpoint('GET', `/api/v2/orders/detail?id=${orderId}`, null);
        results.orders_allowed_statuses = await testEndpoint('GET', `/api/v2/order/allowed-statuses?id=${orderId}`, null);
    }
    
    // 3. SHOPS
    console.log('\n🏪 === SHOPS ENDPOINTS ===');
    results.shops_list = await testEndpoint('GET', '/api/v2/shop/list', null);
    
    // 4. PROFILE & CRM (may be local only)
    console.log('\n👤 === PROFILE & CRM ENDPOINTS ===');
    results.profile = await testEndpoint('GET', '/api/v2/profile', null);
    results.shop_info = await testEndpoint('GET', '/api/v2/shop-info', null);
    results.colleagues = await testEndpoint('GET', '/api/v2/colleagues', null);
    
    // 5. CUSTOMERS (from your codebase)
    console.log('\n👥 === CUSTOMERS ENDPOINTS ===');
    results.customers_list = await testEndpoint('GET', '/api/v2/customers/', null);
    results.customers_with_stats = await testEndpoint('GET', '/api/v2/customers/with-stats/', null);
    results.customers_orders = await testEndpoint('GET', '/api/v2/customers/orders.php', null);
    
    // 6. UPLOADS (test basic endpoint, don't actually upload)
    console.log('\n📤 === UPLOAD ENDPOINTS ===');
    console.log('   ℹ️  Upload endpoints require multipart/form-data - skipping actual upload test');
    
    // Summary
    console.log('\n📊 === RESULTS SUMMARY ===');
    const successful = Object.entries(results).filter(([key, result]) => result.success);
    const failed = Object.entries(results).filter(([key, result]) => !result.success);
    
    console.log(`\n✅ Successful endpoints (${successful.length}):`);
    successful.forEach(([key]) => console.log(`   - ${key}`));
    
    console.log(`\n❌ Failed endpoints (${failed.length}):`);
    failed.forEach(([key, result]) => {
        console.log(`   - ${key}: ${result.status || 'ERROR'} ${result.error || ''}`);
    });
    
    return results;
}

// Run the test
if (require.main === module) {
    testAllEndpoints().catch(console.error);
}

module.exports = { testAllEndpoints, testEndpoint };