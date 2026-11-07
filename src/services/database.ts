import { supabase } from '../lib/supabase';
import {
  AdminUser,
  Brand,
  Product,
  StockMovement,
  Customer,
  CustomerAppointment,
  Order,
  PaymentReceipt,
  PixConfig,
  Coupon,
  GeneralSettings,
  AuditLog,
} from '../types';

import imgNoir from '../assets/images/perfume_noir_elixir_1794025966749.jpg';
import imgOud from '../assets/images/perfume_gold_oud_1794025966380.jpg';
import imgRose from '../assets/images/perfume_rose_velours_1794025967468.jpg';
import imgBlanc from '../assets/images/perfume_blanc_pure_1794025967775.jpg';

export const LUXURY_PRESET_IMAGES = [
  { name: 'Noir Oracle — Extrait de Parfum', url: imgNoir },
  { name: 'Oud Ambre — Eau de Parfum', url: imgOud },
  { name: 'Rêve de Rose & Ambre — Extrait', url: imgRose },
  { name: 'Aurélia Blanche — Haute Parfumerie', url: imgBlanc },
];

// Mappers to bridge Supabase snake_case and TypeScript camelCase
const mappers = {
  profile: (p: any): AdminUser => {
    if (!p) return {} as AdminUser;
    return {
      id: p.id,
      name: p.name || 'Admin',
      email: p.email || '',
      role: p.role || 'CONSULTOR',
      phone: p.phone || '',
      avatar: p.avatar,
      active: p.active ?? true,
      createdAt: p.created_at || p.createdAt,
      lastLogin: p.last_login || p.lastLogin,
    };
  },
  brand: (b: any): Brand => ({
    id: b.id,
    name: b.name,
    country: b.country,
    description: b.description,
    foundedYear: b.founded_year || b.foundedYear,
    status: b.status,
    logoUrl: b.logo_url || b.logoUrl,
    website: b.website,
  }),
  product: (p: any): Product => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    brandId: p.brand_id || p.brandId,
    brandName: p.brands?.name || p.brandName,
    olfactoryFamily: p.olfactory_family || p.olfactoryFamily,
    concentration: p.concentration,
    volumeMl: p.volume_ml || p.volumeMl,
    purchasePrice: p.purchase_price || p.purchasePrice,
    salePrice: p.sale_price || p.salePrice,
    stockQuantity: p.stock_quantity || p.stockQuantity,
    minStockAlert: p.min_stock_alert || p.minStockAlert,
    image: p.image,
    status: p.status,
    description: p.description,
    topNotes: p.top_notes || p.topNotes,
    heartNotes: p.heart_notes || p.heartNotes,
    baseNotes: p.base_notes || p.baseNotes,
    createdAt: p.created_at || p.createdAt,
    updatedAt: p.updated_at || p.updatedAt,
  }),
  movement: (m: any): StockMovement => ({
    id: m.id,
    productId: m.product_id || m.productId,
    productName: m.product_name || m.productName,
    productSku: m.product_sku || m.productSku,
    type: m.type,
    quantity: m.quantity,
    previousStock: m.previous_stock || m.previousStock,
    newStock: m.new_stock || m.newStock,
    unitCost: m.unit_cost || m.unitCost,
    reason: m.reason,
    documentRef: m.document_ref || m.documentRef,
    adminName: m.admin_name || m.adminName,
    date: m.date || m.created_at,
  }),
  customer: (c: any): Customer => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    cpf: c.cpf,
    city: c.city,
    state: c.state,
    address: c.address,
    vipTier: c.vip_tier || c.vipTier,
    totalSpent: c.total_spent || c.totalSpent || 0,
    ordersCount: c.orders_count || c.ordersCount || 0,
    notes: c.notes,
    createdAt: c.created_at || c.createdAt,
  }),
  appointment: (a: any): CustomerAppointment => ({
    id: a.id,
    customerId: a.customer_id || a.customerId,
    customerName: a.customer_name || a.customerName,
    customerPhone: a.customer_phone || a.customerPhone,
    serviceType: a.service_type || a.serviceType,
    date: a.date,
    time: a.time,
    consultant: a.consultant,
    status: a.status,
    notes: a.notes,
    createdAt: a.created_at || a.createdAt,
  }),
  order: (o: any): Order => ({
    id: o.id,
    orderNumber: o.order_number || o.orderNumber,
    customerId: o.customer_id || o.customerId,
    customerName: o.customer_name || o.customerName,
    customerEmail: o.customer_email || o.customerEmail,
    customerPhone: o.customer_phone || o.customerPhone,
    items: o.items || [],
    subtotal: o.subtotal,
    discount: o.discount,
    couponCode: o.coupon_code || o.couponCode,
    shipping: o.shipping,
    total: o.total,
    paymentMethod: o.payment_method || o.paymentMethod,
    paymentStatus: o.payment_status || o.paymentStatus,
    fulfillmentStatus: o.fulfillment_status || o.fulfillmentStatus,
    trackingCode: o.tracking_code || o.trackingCode,
    shippingAddress: o.shipping_address || o.shippingAddress,
    notes: o.notes,
    createdAt: o.created_at || o.createdAt,
  }),
  payment: (p: any): PaymentReceipt => ({
    id: p.id,
    orderId: p.order_id || p.orderId,
    orderNumber: p.order_number || p.orderNumber,
    customerName: p.customer_name || p.customerName,
    amount: p.amount,
    method: p.method,
    status: p.status,
    transactionCode: p.transaction_code || p.transactionCode,
    receiptUrl: p.receipt_url || p.receiptUrl,
    submittedAt: p.submitted_at || p.submittedAt || p.created_at,
    verifiedAt: p.verified_at || p.verifiedAt,
    verifiedBy: p.verified_by || p.verifiedBy,
    notes: p.notes,
  }),
  coupon: (c: any): Coupon => ({
    id: c.id,
    code: c.code,
    description: c.description,
    discountType: c.discount_type || c.discountType,
    value: c.value,
    minOrderValue: c.min_order_value || c.minOrderValue,
    maxUses: c.max_uses || c.maxUses,
    usedCount: c.used_count || c.usedCount || 0,
    validUntil: c.valid_until || c.validUntil,
    status: c.status,
    createdAt: c.created_at || c.createdAt,
  }),
};

export const Database = {
  async init() {}, // No-op for Supabase

  // 1. ADMINS & AUTH (using profiles table)
  async getAdmins(): Promise<AdminUser[]> {
    const { data } = await supabase.from('profiles').select('*').order('name');
    return (data || []).map(mappers.profile);
  },

  async getAdminById(id: string): Promise<AdminUser | undefined> {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
    return data ? mappers.profile(data) : undefined;
  },

  async updateAdmin(id: string, updates: Partial<AdminUser>): Promise<boolean> {
    const sbUpdates: any = { ...updates };
    if (updates.createdAt) { sbUpdates.created_at = updates.createdAt; delete sbUpdates.createdAt; }
    if (updates.lastLogin) { sbUpdates.last_login = updates.lastLogin; delete sbUpdates.lastLogin; }
    
    const { error } = await supabase.from('profiles').update(sbUpdates).eq('id', id);
    if (!error) window.dispatchEvent(new CustomEvent('mr_database_change'));
    return !error;
  },

  async deleteAdmin(id: string, requesterId: string): Promise<{ success: boolean; message: string }> {
    if (id === requesterId) return { success: false, message: 'Você não pode remover seu próprio acesso.' };
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (!error) window.dispatchEvent(new CustomEvent('mr_database_change'));
    return { success: !error, message: error ? error.message : 'Acesso revogado!' };
  },

  // 2. BRANDS
  async getBrands(): Promise<Brand[]> {
    const { data } = await supabase.from('brands').select('*').order('name');
    return (data || []).map(mappers.brand);
  },

  async saveBrand(brand: Brand): Promise<{ success: boolean; message: string }> {
    const payload = {
      ...brand,
      founded_year: brand.foundedYear,
      logo_url: brand.logoUrl,
    };
    delete (payload as any).foundedYear;
    delete (payload as any).logoUrl;
    if (!payload.id) delete (payload as any).id;

    const { error } = await supabase.from('brands').upsert(payload);
    if (!error) window.dispatchEvent(new CustomEvent('mr_database_change'));
    return { success: !error, message: error ? error.message : 'Marca salva!' };
  },

  async deleteBrand(id: string): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase.from('brands').delete().eq('id', id);
    if (!error) window.dispatchEvent(new CustomEvent('mr_database_change'));
    return { success: !error, message: error ? error.message : 'Marca removida!' };
  },

  // 3. PRODUCTS
  async getProducts(): Promise<Product[]> {
    const { data } = await supabase.from('products').select('*, brands(name)').order('name');
    return (data || []).map(mappers.product);
  },

  async saveProduct(product: Product): Promise<{ success: boolean; message: string }> {
    const payload: any = {
      ...product,
      brand_id: product.brandId,
      olfactory_family: product.olfactoryFamily,
      volume_ml: product.volumeMl,
      purchase_price: product.purchasePrice,
      sale_price: product.salePrice,
      stock_quantity: product.stockQuantity,
      min_stock_alert: product.minStockAlert,
      top_notes: product.topNotes,
      heart_notes: product.heartNotes,
      base_notes: product.baseNotes,
    };
    delete payload.brandId;
    delete payload.brandName;
    delete payload.olfactoryFamily;
    delete payload.volumeMl;
    delete payload.purchasePrice;
    delete payload.salePrice;
    delete payload.stockQuantity;
    delete payload.minStockAlert;
    delete payload.topNotes;
    delete payload.heartNotes;
    delete payload.baseNotes;
    delete payload.createdAt;
    delete payload.updatedAt;
    if (!payload.id) delete payload.id;

    const { error } = await supabase.from('products').upsert(payload);
    if (!error) window.dispatchEvent(new CustomEvent('mr_database_change'));
    return { success: !error, message: error ? error.message : 'Produto salvo!' };
  },

  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) window.dispatchEvent(new CustomEvent('mr_database_change'));
    return { success: !error, message: error ? error.message : 'Produto removido!' };
  },

  // 4 & 5. STOCK & MOVEMENTS
  async getStockMovements(): Promise<StockMovement[]> {
    const { data } = await supabase.from('stock_movements').select('*').order('created_at', { ascending: false });
    return (data || []).map(mappers.movement);
  },

  async registerStockMovement(movement: any): Promise<{ success: boolean; message: string }> {
    const payload = {
      product_id: movement.productId,
      product_name: movement.productName,
      product_sku: movement.productSku,
      type: movement.type,
      quantity: movement.quantity,
      previous_stock: movement.previousStock,
      new_stock: movement.newStock,
      unit_cost: movement.unitCost,
      reason: movement.reason,
      document_ref: movement.documentRef,
      admin_name: movement.adminName,
    };

    const { error: moveError } = await supabase.from('stock_movements').insert(payload);
    if (moveError) return { success: false, message: moveError.message };

    // Update product quantity
    const { error: prodError } = await supabase.from('products').update({ stock_quantity: movement.newStock }).eq('id', movement.productId);
    
    if (!prodError) window.dispatchEvent(new CustomEvent('mr_database_change'));

    return { success: !prodError, message: prodError ? prodError.message : 'Movimentação registrada e estoque atualizado!' };
  },

  // 6. CUSTOMERS
  async getCustomers(): Promise<Customer[]> {
    const { data } = await supabase.from('customers').select('*').order('name');
    return (data || []).map(mappers.customer);
  },

  async saveCustomer(customer: Customer): Promise<{ success: boolean; message: string }> {
    const payload: any = {
      ...customer,
      vip_tier: customer.vipTier,
      total_spent: customer.totalSpent,
      orders_count: customer.ordersCount,
    };
    delete payload.vipTier;
    delete payload.totalSpent;
    delete payload.ordersCount;
    delete payload.createdAt;
    if (!payload.id) delete payload.id;

    const { error } = await supabase.from('customers').upsert(payload);
    if (!error) window.dispatchEvent(new CustomEvent('mr_database_change'));
    return { success: !error, message: error ? error.message : 'Cliente salvo!' };
  },

  async deleteCustomer(id: string): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (!error) window.dispatchEvent(new CustomEvent('mr_database_change'));
    return { success: !error, message: error ? error.message : 'Cliente removido!' };
  },

  // 7. APPOINTMENTS
  async getAppointments(): Promise<CustomerAppointment[]> {
    const { data } = await supabase.from('appointments').select('*').order('date', { ascending: false });
    return (data || []).map(mappers.appointment);
  },

  async saveAppointment(app: CustomerAppointment): Promise<{ success: boolean; message: string }> {
    const payload: any = {
      ...app,
      customer_id: app.customerId,
      customer_name: app.customerName,
      customer_phone: app.customerPhone,
      service_type: app.serviceType,
    };
    delete payload.customerId;
    delete payload.customerName;
    delete payload.customerPhone;
    delete payload.serviceType;
    delete payload.createdAt;
    if (!payload.id) delete payload.id;

    const { error } = await supabase.from('appointments').upsert(payload);
    if (!error) window.dispatchEvent(new CustomEvent('mr_database_change'));
    return { success: !error, message: error ? error.message : 'Agendamento salvo!' };
  },

  async deleteAppointment(id: string): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (!error) window.dispatchEvent(new CustomEvent('mr_database_change'));
    return { success: !error, message: error ? error.message : 'Agendamento removido!' };
  },

  // 8. ORDERS
  async getOrders(): Promise<Order[]> {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    return (data || []).map(mappers.order);
  },

  async saveOrder(order: Order): Promise<{ success: boolean; message: string }> {
    // Generate order number if new
    let orderNum = order.orderNumber;
    if (!orderNum) {
      orderNum = 'MR-' + Math.floor(1000 + Math.random() * 9000);
    }

    const payload: any = {
      ...order,
      order_number: orderNum,
      customer_id: order.customerId,
      customer_name: order.customerName,
      customer_email: order.customerEmail,
      customer_phone: order.customerPhone,
      coupon_code: order.couponCode,
      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus,
      fulfillment_status: order.fulfillmentStatus,
      tracking_code: order.trackingCode,
      shipping_address: order.shippingAddress,
    };
    delete payload.orderNumber;
    delete payload.customerId;
    delete payload.customerName;
    delete payload.customerEmail;
    delete payload.customerPhone;
    delete payload.couponCode;
    delete payload.paymentMethod;
    delete payload.paymentStatus;
    delete payload.fulfillmentStatus;
    delete payload.trackingCode;
    delete payload.shippingAddress;
    delete payload.createdAt;
    if (!payload.id) delete payload.id;

    const { error } = await supabase.from('orders').upsert(payload);
    if (error) return { success: false, message: error.message };

    // After saving order, update customer totals
    const { data: custOrders } = await supabase.from('orders').select('total').eq('customer_id', order.customerId).eq('payment_status', 'Aprovado');
    if (custOrders) {
        const totalSpent = custOrders.reduce((sum, o) => sum + o.total, 0);
        await supabase.from('customers').update({ 
            total_spent: totalSpent, 
            orders_count: custOrders.length 
        }).eq('id', order.customerId);
    }

    window.dispatchEvent(new CustomEvent('mr_database_change'));
    return { success: true, message: `Pedido ${orderNum} salvo!` };
  },

  async deleteOrder(id: string): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (!error) window.dispatchEvent(new CustomEvent('mr_database_change'));
    return { success: !error, message: error ? error.message : 'Pedido removido!' };
  },

  async updateOrderStatus(orderId: string, paymentStatus?: string, fulfillmentStatus?: string, trackingCode?: string): Promise<boolean> {
    const updates: any = {};
    if (paymentStatus) updates.payment_status = paymentStatus;
    if (fulfillmentStatus) updates.fulfillment_status = fulfillmentStatus;
    if (trackingCode) updates.tracking_code = trackingCode;

    const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
    if (!error) window.dispatchEvent(new CustomEvent('mr_database_change'));
    return !error;
  },

  // 9. PAYMENTS
  async getPaymentReceipts(): Promise<PaymentReceipt[]> {
    const { data } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
    return (data || []).map(mappers.payment);
  },

  async savePaymentReceipt(receipt: PaymentReceipt): Promise<{ success: boolean; message: string }> {
    const payload: any = {
      ...receipt,
      order_id: receipt.orderId,
      order_number: receipt.orderNumber,
      customer_name: receipt.customerName,
      transaction_code: receipt.transactionCode,
      receipt_url: receipt.receiptUrl,
      submitted_at: receipt.submittedAt,
      verified_at: receipt.verifiedAt,
      verified_by: receipt.verifiedBy,
    };
    delete payload.orderId;
    delete payload.orderNumber;
    delete payload.customerName;
    delete payload.transactionCode;
    delete payload.receiptUrl;
    delete payload.submittedAt;
    delete payload.verifiedAt;
    delete payload.verifiedBy;
    if (!payload.id) delete payload.id;

    const { error } = await supabase.from('payments').upsert(payload);
    return { success: !error, message: error ? error.message : 'Pagamento salvo!' };
  },

  async updatePaymentVerification(id: string, status: string, verifiedBy: string): Promise<boolean> {
    const { data: pay } = await supabase.from('payments').select('*').eq('id', id).single();
    if (!pay) return false;

    const { error } = await supabase.from('payments').update({ 
        status, 
        verified_by: verifiedBy,
        verified_at: new Date().toISOString()
    }).eq('id', id);

    if (!error && status === 'Verificado') {
        await this.updateOrderStatus(pay.order_id, 'Aprovado');
    }
    
    return !error;
  },

  // 10. PIX
  async getPixConfig(): Promise<PixConfig> {
    const { data } = await supabase.from('settings').select('*').eq('key', 'pix_config').single();
    return data?.value || {
        keyType: 'CNPJ',
        pixKey: '',
        beneficiaryName: '',
        bankName: '',
        city: 'São Paulo',
        active: false,
        instructions: '',
    };
  },

  async savePixConfig(config: PixConfig): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase.from('settings').upsert({ key: 'pix_config', value: config }, { onConflict: 'key' });
    return { success: !error, message: error ? error.message : 'Config Pix salva!' };
  },

  // 11. COUPONS
  async getCoupons(): Promise<Coupon[]> {
    const { data } = await supabase.from('coupons').select('*').order('code');
    return (data || []).map(mappers.coupon);
  },

  async saveCoupon(coupon: Coupon): Promise<{ success: boolean; message: string }> {
    const payload: any = {
      ...coupon,
      discount_type: coupon.discountType,
      min_order_value: coupon.minOrderValue,
      max_uses: coupon.maxUses,
      used_count: coupon.usedCount,
      valid_until: coupon.validUntil,
    };
    delete payload.discountType;
    delete payload.minOrderValue;
    delete payload.maxUses;
    delete payload.usedCount;
    delete payload.validUntil;
    delete payload.createdAt;
    if (!payload.id) delete payload.id;

    const { error } = await supabase.from('coupons').upsert(payload);
    return { success: !error, message: error ? error.message : 'Cupom salvo!' };
  },

  async deleteCoupon(id: string): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    return { success: !error, message: error ? error.message : 'Cupom removido!' };
  },

  // 12. METRICS
  async getRealMetrics() {
    const orders = await this.getOrders();
    const products = await this.getProducts();
    const customers = await this.getCustomers();
    // const movements = await this.getStockMovements();
    
    const approvedOrders = orders.filter(o => o.paymentStatus === 'Aprovado');
    const totalRevenue = approvedOrders.reduce((sum, o) => sum + o.total, 0);
    const approvedOrdersCount = approvedOrders.length;
    const totalOrdersCount = orders.length;
    const averageTicket = approvedOrdersCount > 0 ? totalRevenue / approvedOrdersCount : 0;

    const totalStockBottles = products.reduce((sum, p) => sum + p.stockQuantity, 0);
    const totalInventorySaleValue = products.reduce((sum, p) => sum + (p.stockQuantity * p.salePrice), 0);
    const totalInventoryCostValue = products.reduce((sum, p) => sum + (p.stockQuantity * p.purchasePrice), 0);
    const potentialProfit = totalInventorySaleValue - totalInventoryCostValue;

    const lowStockAlerts = products.filter(p => p.stockQuantity <= p.minStockAlert);
    
    const diamondVipCount = customers.filter(c => c.vipTier === 'Diamond Club').length;
    const goldVipCount = customers.filter(c => c.vipTier === 'Gold VIP').length;

    const paymentBreakdown = {
      Pix: approvedOrders.filter(o => o.paymentMethod === 'Pix').reduce((sum, o) => sum + o.total, 0),
      Cartao: approvedOrders.filter(o => o.paymentMethod === 'Cartão de Crédito').reduce((sum, o) => sum + o.total, 0),
      Boleto: approvedOrders.filter(o => o.paymentMethod === 'Boleto Bancário').reduce((sum, o) => sum + o.total, 0),
    };

    // Calculate top selling products
    const productSales: Record<string, { name: string; sku: string; unitsSold: number; totalGross: number }> = {};
    approvedOrders.forEach(o => {
      o.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.productName, sku: item.sku, unitsSold: 0, totalGross: 0 };
        }
        productSales[item.productId].unitsSold += item.quantity;
        productSales[item.productId].totalGross += item.totalPrice;
      });
    });

    const topSellingProducts = Object.values(productSales).sort((a, b) => b.unitsSold - a.unitsSold);
    const recentOrders = orders.slice(0, 5);

    return {
      totalRevenue,
      approvedOrdersCount,
      totalOrdersCount,
      averageTicket,
      totalStockBottles,
      totalInventorySaleValue,
      totalInventoryCostValue,
      potentialProfit,
      lowStockAlerts,
      totalCustomers: customers.length,
      diamondVipCount,
      goldVipCount,
      paymentBreakdown,
      topSellingProducts,
      recentOrders,
    };
  },

  // 13. SETTINGS
  async getSettings(): Promise<GeneralSettings> {
    const { data } = await supabase.from('settings').select('*').eq('key', 'general_settings').single();
    return data?.value || {
        storeName: 'Maison Royale',
        tagline: 'Haute Parfumerie',
        cnpj: '',
        phone: '',
        email: '',
        address: '',
        freeShippingThreshold: 500,
        defaultShippingCost: 50,
        lowStockAlertThreshold: 5,
        currencySymbol: 'R$',
        maintenanceMode: false,
        notificationSound: true,
    };
  },

  async saveSettings(settings: GeneralSettings): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase.from('settings').upsert({ key: 'general_settings', value: settings }, { onConflict: 'key' });
    return { success: !error, message: error ? error.message : 'Config salvas!' };
  },

  // 14. AUDIT
  async getAuditLogs(): Promise<AuditLog[]> {
    const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    return (data || []).map(l => ({
        id: l.id,
        adminName: l.admin_name,
        adminEmail: l.admin_email,
        action: l.action,
        category: l.category,
        details: l.details,
        timestamp: l.created_at
    }));
  },

  async logAudit(adminName: string, adminEmail: string, action: string, category: any, details: string) {
    await supabase.from('audit_logs').insert({ 
        admin_name: adminName, 
        admin_email: adminEmail, 
        action, 
        category, 
        details 
    });
    window.dispatchEvent(new CustomEvent('mr_database_change'));
  },
};
