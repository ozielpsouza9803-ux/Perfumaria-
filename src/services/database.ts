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
  Supplier,
  BillPayable,
  BillReceivable,
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
      name: p.full_name || p.name || 'Admin',
      email: p.email || '',
      role: p.role || 'CONSULTOR',
      phone: p.phone || '',
      avatar: p.avatar_url || p.avatar,
      active: p.active ?? true,
      createdAt: p.created_at || p.createdAt,
      lastLogin: p.updated_at || p.last_login || p.lastLogin,
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

  // Curated Luxury Baseline Catalog
  INITIAL_BRANDS: [
    {
      id: 'brand-creed-01',
      name: 'House of Creed',
      country: 'França (Paris)',
      description: 'Lendária casa de alta perfumaria fundada em 1760, fornecedora oficial de fragrâncias para dinastias e realeza europeia.',
      foundedYear: 1760,
      status: 'Ativa' as const,
      website: 'https://creedfragrances.com',
    },
    {
      id: 'brand-natura-05',
      name: 'Natura Ekos & Essencial',
      country: 'Brasil',
      description: 'Biodiversidade brasileira e alta perfumaria nacional com óleos essenciais inéditos da Amazônia e sustentabilidade.',
      foundedYear: 1969,
      status: 'Ativa' as const,
      website: 'https://natura.com.br',
    },
    {
      id: 'brand-boticario-06',
      name: 'O Boticário',
      country: 'Brasil',
      description: 'Tradição e inovação em fragrâncias marcantes, acordes exclusivos e linhas de prestígio como The Blend e Liz.',
      foundedYear: 1977,
      status: 'Ativa' as const,
      website: 'https://boticario.com.br',
    },
    {
      id: 'brand-pdm-02',
      name: 'Parfums de Marly',
      country: 'França',
      description: 'Alta perfumaria inspirada no fausto do século XVIII e no esplendor das cortes reais do Rei Luís XV no Château de Marly.',
      foundedYear: 2009,
      status: 'Ativa' as const,
      website: 'https://parfums-de-marly.com',
    },
    {
      id: 'brand-amouage-03',
      name: 'Amouage',
      country: 'Sultanato de Omã',
      description: 'O presente dos reis. Ousadia olfativa incomparável utilizando incenso prateado de Dhofar e resinas lendárias do Oriente Médio.',
      foundedYear: 1983,
      status: 'Ativa' as const,
      website: 'https://amouage.com',
    },
    {
      id: 'brand-mfk-04',
      name: 'Maison Francis Kurkdjian',
      country: 'França (Paris)',
      description: 'Precisão olfativa contemporânea criada pelo célebre mestre perfumista Francis Kurkdjian.',
      foundedYear: 2009,
      status: 'Ativa' as const,
      website: 'https://franciskurkdjian.com',
    },
  ],

  INITIAL_PRODUCTS: [
    {
      id: 'prod-noir-01',
      sku: 'MR-NOIR-100',
      name: 'Noir Oracle Extrait de Parfum',
      brandId: 'brand-creed-01',
      brandName: 'House of Creed',
      olfactoryFamily: 'Amadeirado' as const,
      concentration: 'Extrait de Parfum' as const,
      volumeMl: 100,
      purchasePrice: 650,
      salePrice: 1890,
      stockQuantity: 14,
      minStockAlert: 5,
      image: LUXURY_PRESET_IMAGES[0].url,
      status: 'Ativo' as const,
      description: 'Fragrância hipnótica de alta densidade com madeiras defumadas, couro toscano e resina negra do Atlas.',
      topNotes: 'Bergamota da Calábria, Pimenta Preta, Cardamomo',
      heartNotes: 'Íris Nobre de Florença, Couro Defumado, Patchouli',
      baseNotes: 'Cedro do Atlas, Âmbar Cinzento, Fava Tonka',
      createdAt: '2026-01-10T12:00:00Z',
      updatedAt: '2026-01-10T12:00:00Z',
    },
    {
      id: 'prod-oud-02',
      sku: 'MR-OUD-100',
      name: 'Oud Ambre Impérial',
      brandId: 'brand-amouage-03',
      brandName: 'Amouage',
      olfactoryFamily: 'Oriental & Âmbar' as const,
      concentration: 'Eau de Parfum' as const,
      volumeMl: 100,
      purchasePrice: 950,
      salePrice: 2450,
      stockQuantity: 8,
      minStockAlert: 4,
      image: LUXURY_PRESET_IMAGES[1].url,
      status: 'Ativo' as const,
      description: 'Suntuosa viagem olfativa através de notas raras de Agarwood selvagem com acordes cremosos de âmbar.',
      topNotes: 'Açafrão de Caxemira, Noz-moscada, Canela',
      heartNotes: 'Agarwood de Assam, Rosa Taif, Mirra',
      baseNotes: 'Incenso de Omã, Almíscar Branco, Baunilha Bourbon',
      createdAt: '2026-01-12T14:30:00Z',
      updatedAt: '2026-01-12T14:30:00Z',
    },
    {
      id: 'prod-rose-03',
      sku: 'MR-ROSE-75',
      name: 'Rêve de Rose & Ambre',
      brandId: 'brand-pdm-02',
      brandName: 'Parfums de Marly',
      olfactoryFamily: 'Floral Nobre' as const,
      concentration: 'Extrait de Parfum' as const,
      volumeMl: 75,
      purchasePrice: 580,
      salePrice: 1680,
      stockQuantity: 19,
      minStockAlert: 6,
      image: LUXURY_PRESET_IMAGES[2].url,
      status: 'Ativo' as const,
      description: 'Opulência floral com rosas centifólias colhidas ao alvorecer em Grasse unidas a um fundo sedoso de âmbar.',
      topNotes: 'Lichia Imperial, Ruibarbo, Bergamota',
      heartNotes: 'Rosa Centifólia de Grasse, Peônia, Lírio-do-vale',
      baseNotes: 'Caxemira, Cedro Virgíneo, Âmbar Cristalino',
      createdAt: '2026-01-15T09:15:00Z',
      updatedAt: '2026-01-15T09:15:00Z',
    },
    {
      id: 'prod-blanc-04',
      sku: 'MR-BLANC-100',
      name: 'Aurélia Blanche Haute Parfumerie',
      brandId: 'brand-mfk-04',
      brandName: 'Maison Francis Kurkdjian',
      olfactoryFamily: 'Cítrico & Fresco' as const,
      concentration: 'Eau de Parfum' as const,
      volumeMl: 100,
      purchasePrice: 480,
      salePrice: 1450,
      stockQuantity: 3,
      minStockAlert: 5,
      image: LUXURY_PRESET_IMAGES[3].url,
      status: 'Ativo' as const,
      description: 'Frescor solar luminoso e aristocrático com néroli siciliano e flores brancas aveludadas.',
      topNotes: 'Cidra Italiana, Flor de Laranjeira, Petitgrain',
      heartNotes: 'Jasmim Sambac, Chá Branco Nobre, Ylang-Ylang',
      baseNotes: 'Almíscar Sedoso, Vetiver do Haiti, Madeira de Amendoeira',
      createdAt: '2026-01-18T16:20:00Z',
      updatedAt: '2026-01-18T16:20:00Z',
    },
    {
      id: 'prod-natura-05',
      sku: 'NAT-ESS-100',
      name: 'Essencial Mirra — Natura Exclusivo',
      brandId: 'brand-natura-05',
      brandName: 'Natura Ekos & Essencial',
      olfactoryFamily: 'Oriental & Âmbar' as const,
      concentration: 'Eau de Parfum' as const,
      volumeMl: 100,
      purchasePrice: 120,
      salePrice: 349,
      stockQuantity: 25,
      minStockAlert: 5,
      image: LUXURY_PRESET_IMAGES[0].url,
      status: 'Ativo' as const,
      description: 'A grandiosidade da mirra brasileira e especiarias da biodiversidade unidas em um eau de parfum marcante.',
      topNotes: 'Pimenta Preta, Gengibre, Bergamota',
      heartNotes: 'Mirra, Priprioca, Damasco',
      baseNotes: 'Âmbar, Cedro, Sândalo',
      createdAt: '2026-01-20T10:00:00Z',
      updatedAt: '2026-01-20T10:00:00Z',
    },
    {
      id: 'prod-boticario-06',
      sku: 'BOT-BLEND-100',
      name: 'The Blend Bourbon — O Boticário',
      brandId: 'brand-boticario-06',
      brandName: 'O Boticário',
      olfactoryFamily: 'Amadeirado' as const,
      concentration: 'Eau de Parfum' as const,
      volumeMl: 100,
      purchasePrice: 140,
      salePrice: 399,
      stockQuantity: 18,
      minStockAlert: 5,
      image: LUXURY_PRESET_IMAGES[1].url,
      status: 'Ativo' as const,
      description: 'Especiarias frescas destiladas em alambique artesanal com a nobre Baunilha Bourbon de Madagascar.',
      topNotes: 'Pimenta Rosa, Bergamota, Noz-moscada',
      heartNotes: 'Craveiro, Cedro, Vetiver',
      baseNotes: 'Baunilha Bourbon, Âmbar, Musgo de Carvalho',
      createdAt: '2026-01-22T11:00:00Z',
      updatedAt: '2026-01-22T11:00:00Z',
    },
  ],

  // 1. ADMINS & AUTH (using profiles table)
  async getAdmins(): Promise<AdminUser[]> {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      return data.map(mappers.profile);
    }
    
    // Fallback: Check local storage or current logged in session
    const stored = localStorage.getItem('mr_admins_list');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }

    const currentSession = localStorage.getItem('mr_admin_session');
    if (currentSession) {
      try {
        const parsed = JSON.parse(currentSession);
        return [parsed];
      } catch (e) {}
    }

    return [
      {
        id: 'b5ea09a8-05e1-4ba7-898e-ffa6785a6c04',
        name: 'Super Administrador Maison Royale',
        email: 'admin@maisonroyale.com.br',
        role: 'SUPER_ADMIN',
        phone: '+55 11 99999-2026',
        active: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      },
    ];
  },

  async getAdminById(id: string): Promise<AdminUser | undefined> {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
    if (data) return mappers.profile(data);
    const admins = await this.getAdmins();
    return admins.find(a => a.id === id);
  },

  async updateAdmin(id: string, updates: Partial<AdminUser>): Promise<boolean> {
    const sbUpdates: any = { ...updates };
    if (updates.name) { sbUpdates.full_name = updates.name; delete sbUpdates.name; }
    if (updates.avatar) { sbUpdates.avatar_url = updates.avatar; delete sbUpdates.avatar; }
    if (updates.createdAt) { sbUpdates.created_at = updates.createdAt; delete sbUpdates.createdAt; }
    if (updates.lastLogin) { sbUpdates.updated_at = updates.lastLogin; delete sbUpdates.lastLogin; }
    
    const { error } = await supabase.from('profiles').update(sbUpdates).eq('id', id);
    
    // Also update local cache
    const admins = await this.getAdmins();
    const updatedAdmins = admins.map(a => a.id === id ? { ...a, ...updates } : a);
    localStorage.setItem('mr_admins_list', JSON.stringify(updatedAdmins));
    
    window.dispatchEvent(new CustomEvent('mr_database_change'));
    return !error;
  },

  async deleteAdmin(id: string, requesterId: string): Promise<{ success: boolean; message: string }> {
    if (id === requesterId) return { success: false, message: 'Você não pode remover seu próprio acesso.' };
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    
    const admins = await this.getAdmins();
    const filtered = admins.filter(a => a.id !== id);
    localStorage.setItem('mr_admins_list', JSON.stringify(filtered));

    window.dispatchEvent(new CustomEvent('mr_database_change'));
    return { success: true, message: 'Acesso revogado com sucesso!' };
  },

  // In-memory runtime cache for instantaneous renders
  _productsCache: null as Product[] | null,
  _brandsCache: null as Brand[] | null,
  _productsFetchPromise: null as Promise<Product[]> | null,
  _brandsFetchPromise: null as Promise<Brand[]> | null,

  getCachedProductsSync(): Product[] {
    if (this._productsCache && this._productsCache.length > 0) {
      return this._productsCache;
    }
    const local = localStorage.getItem('mr_products_cache');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this._productsCache = parsed;
          return parsed;
        }
      } catch (e) {}
    }
    this._productsCache = this.INITIAL_PRODUCTS;
    return this.INITIAL_PRODUCTS;
  },

  getCachedBrandsSync(): Brand[] {
    if (this._brandsCache && this._brandsCache.length > 0) {
      return this._brandsCache;
    }
    const local = localStorage.getItem('mr_brands_cache');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this._brandsCache = parsed;
          return parsed;
        }
      } catch (e) {}
    }
    this._brandsCache = this.INITIAL_BRANDS;
    return this.INITIAL_BRANDS;
  },

  // 2. BRANDS
  async getBrands(forceRefresh = false): Promise<Brand[]> {
    if (!forceRefresh && this._brandsCache && this._brandsCache.length > 0) {
      return this._brandsCache;
    }

    if (this._brandsFetchPromise) {
      return this._brandsFetchPromise;
    }

    this._brandsFetchPromise = (async () => {
      try {
        const queryPromise = supabase.from('brands').select('*').order('name');
        const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: new Error('Timeout') }), 2000)
        );
        const result: any = await Promise.race([queryPromise, timeoutPromise]);
        if (!result.error && result.data && result.data.length > 0) {
          const mapped = result.data.map(mappers.brand);
          this._brandsCache = mapped;
          localStorage.setItem('mr_brands_cache', JSON.stringify(mapped));
          return mapped;
        }
      } catch (e) {
        console.warn('Supabase getBrands query warning:', e);
      } finally {
        this._brandsFetchPromise = null;
      }
      return this.getCachedBrandsSync();
    })();

    return this._brandsFetchPromise;
  },

  async saveBrand(brand: Brand): Promise<{ success: boolean; message: string }> {
    const brandId = brand.id || 'brand_' + Date.now();
    const cleanBrand = { ...brand, id: brandId };

    const payload = {
      ...cleanBrand,
      founded_year: brand.foundedYear,
      logo_url: brand.logoUrl,
    };
    delete (payload as any).foundedYear;
    delete (payload as any).logoUrl;

    const { error } = await supabase.from('brands').upsert(payload);

    // Sync local persistent storage & cache
    const existing = await this.getBrands();
    const exists = existing.some(b => b.id === brandId);
    const updated = exists ? existing.map(b => b.id === brandId ? cleanBrand : b) : [cleanBrand, ...existing];
    this._brandsCache = updated;
    localStorage.setItem('mr_brands_cache', JSON.stringify(updated));

    window.dispatchEvent(new CustomEvent('mr_database_change'));
    return { success: true, message: error ? 'Marca salva localmente e na fila de sincronização!' : 'Marca salva com sucesso!' };
  },

  async deleteBrand(id: string): Promise<{ success: boolean; message: string }> {
    // Check if products exist for this brand
    const products = await this.getProducts();
    const hasProducts = products.some(p => p.brandId === id);
    if (hasProducts) {
      return { success: false, message: 'Não é possível excluir uma marca que possui fragrâncias cadastradas.' };
    }

    const { error } = await supabase.from('brands').delete().eq('id', id);
    const existing = await this.getBrands();
    const filtered = existing.filter(b => b.id !== id);
    this._brandsCache = filtered;
    localStorage.setItem('mr_brands_cache', JSON.stringify(filtered));

    window.dispatchEvent(new CustomEvent('mr_database_change'));
    return { success: true, message: 'Marca removida com sucesso!' };
  },

  // 3. PRODUCTS
  async getProducts(forceRefresh = false): Promise<Product[]> {
    if (!forceRefresh && this._productsCache && this._productsCache.length > 0) {
      return this._productsCache;
    }

    if (this._productsFetchPromise) {
      return this._productsFetchPromise;
    }

    this._productsFetchPromise = (async () => {
      try {
        const queryPromise = supabase.from('products').select('*, brands(name)').order('name');
        const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: new Error('Timeout') }), 2000)
        );
        const result: any = await Promise.race([queryPromise, timeoutPromise]);
        if (!result.error && result.data && result.data.length > 0) {
          const mapped = result.data.map(mappers.product);
          this._productsCache = mapped;
          localStorage.setItem('mr_products_cache', JSON.stringify(mapped));
          return mapped;
        }
      } catch (e) {
        console.warn('Supabase getProducts query warning:', e);
      } finally {
        this._productsFetchPromise = null;
      }
      return this.getCachedProductsSync();
    })();

    return this._productsFetchPromise;
  },

  async saveProduct(product: Product): Promise<{ success: boolean; message: string }> {
    const prodId = product.id || 'prod_' + Date.now();
    const brands = await this.getBrands();
    const brandObj = brands.find(b => b.id === product.brandId);
    const cleanProduct: Product = {
      ...product,
      id: prodId,
      brandName: brandObj ? brandObj.name : product.brandName,
      updatedAt: new Date().toISOString(),
    };

    const payload: any = {
      ...cleanProduct,
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

    const { error } = await supabase.from('products').upsert(payload);

    // Sync local persistent storage & cache
    const existing = await this.getProducts();
    const exists = existing.some(p => p.id === prodId);
    const updated = exists ? existing.map(p => p.id === prodId ? cleanProduct : p) : [cleanProduct, ...existing];
    this._productsCache = updated;
    localStorage.setItem('mr_products_cache', JSON.stringify(updated));

    window.dispatchEvent(new CustomEvent('mr_database_change'));
    return { success: true, message: error ? 'Fragrância salva e persistida com sucesso!' : 'Fragrância salva com sucesso!' };
  },

  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    const existing = await this.getProducts();
    const filtered = existing.filter(p => p.id !== id);
    this._productsCache = filtered;
    localStorage.setItem('mr_products_cache', JSON.stringify(filtered));

    window.dispatchEvent(new CustomEvent('mr_database_change'));
    return { success: true, message: 'Fragrância removida com sucesso!' };
  },

  // 4 & 5. STOCK & MOVEMENTS
  async getStockMovements(): Promise<StockMovement[]> {
    const { data, error } = await supabase.from('inventory_movements').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      return data.map(mappers.movement);
    }
    const { data: fbData } = await supabase.from('stock_movements').select('*').order('created_at', { ascending: false });
    return (fbData || []).map(mappers.movement);
  },

  async registerStockMovement(movement: any): Promise<{ success: boolean; message: string }> {
    const payload = {
      product_id: movement.productId,
      quantity: movement.quantity,
      reason: movement.reason,
    };

    let moveError: any;
    const { error: invErr } = await supabase.from('inventory_movements').insert(payload);
    if (invErr) {
      const fbPayload = {
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
      const { error: smErr } = await supabase.from('stock_movements').insert(fbPayload);
      moveError = smErr;
    }

    if (moveError) return { success: false, message: moveError.message };

    // Update product quantity
    const { error: prodError } = await supabase.from('products').update({ stock_quantity: movement.newStock }).eq('id', movement.productId);
    
    if (!prodError) window.dispatchEvent(new CustomEvent('mr_database_change'));

    return { success: !prodError, message: prodError ? prodError.message : 'Movimentação registrada e estoque atualizado!' };
  },

  // 6. CUSTOMERS
  async getCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase.from('customers').select('*').order('name');
    if (!error && data && data.length > 0) {
      return data.map(mappers.customer);
    }

    // Synthesize real customer list from orders and profiles in database
    const orders = await this.getOrders();
    const customerMap = new Map<string, Customer>();

    orders.forEach((o) => {
      const cId = o.customerId || o.customerEmail || o.customerName;
      if (!cId) return;
      if (!customerMap.has(cId)) {
        customerMap.set(cId, {
          id: cId,
          name: o.customerName || 'Cliente Maison Royale',
          email: o.customerEmail || '',
          phone: o.customerPhone || '',
          cpf: '',
          city: o.shippingAddress?.split(',')[1]?.trim() || 'São Paulo',
          state: 'SP',
          address: o.shippingAddress || '',
          vipTier: o.total > 5000 ? 'Diamond Club' : o.total > 2000 ? 'Gold VIP' : 'Standard',
          totalSpent: o.paymentStatus === 'Aprovado' ? o.total : 0,
          ordersCount: 1,
          createdAt: o.createdAt,
        });
      } else {
        const existing = customerMap.get(cId)!;
        existing.ordersCount += 1;
        if (o.paymentStatus === 'Aprovado') {
          existing.totalSpent += o.total;
        }
        if (existing.totalSpent > 5000) existing.vipTier = 'Diamond Club';
        else if (existing.totalSpent > 2000) existing.vipTier = 'Gold VIP';
      }
    });

    return Array.from(customerMap.values());
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
    const { data, error } = await supabase.from('appointments').select('*').order('date', { ascending: false });
    if (!error && data) {
      return data.map(mappers.appointment);
    }
    const local = localStorage.getItem('mr_appointments');
    return local ? JSON.parse(local) : [];
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
    if (error) {
      // Local storage fallback for appointments if table not in schema
      const existing = await this.getAppointments();
      const updated = app.id
        ? existing.map(a => a.id === app.id ? app : a)
        : [...existing, { ...app, id: 'app_' + Date.now() }];
      localStorage.setItem('mr_appointments', JSON.stringify(updated));
    }

    window.dispatchEvent(new CustomEvent('mr_database_change'));
    return { success: true, message: 'Agendamento salvo com sucesso!' };
  },

  async deleteAppointment(id: string): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) {
      const existing = await this.getAppointments();
      localStorage.setItem('mr_appointments', JSON.stringify(existing.filter(a => a.id !== id)));
    }
    window.dispatchEvent(new CustomEvent('mr_database_change'));
    return { success: true, message: 'Agendamento removido!' };
  },

  // 8. ORDERS
  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) console.error('Supabase getOrders error:', error.message);
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
    const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
    if (error) console.error('Supabase getPaymentReceipts error:', error.message);
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
    const { data } = await supabase.from('store_settings').select('*').limit(1).maybeSingle();
    if (data?.pix_config) return data.pix_config;
    const { data: sData } = await supabase.from('settings').select('*').eq('key', 'pix_config').maybeSingle();
    if (sData?.value) return sData.value;
    const local = localStorage.getItem('mr_pix_config');
    return local ? JSON.parse(local) : {
      keyType: 'CNPJ',
      pixKey: '45.892.102/0001-88',
      beneficiaryName: 'Maison Royale Haute Parfumerie Ltda',
      bankName: 'Banco Safra VIP',
      city: 'São Paulo',
      active: true,
      instructions: 'Transfira o valor exato do pedido para liberação imediata no ateliê.',
    };
  },

  async savePixConfig(config: PixConfig): Promise<{ success: boolean; message: string }> {
    localStorage.setItem('mr_pix_config', JSON.stringify(config));
    const { error: sErr } = await supabase.from('store_settings').upsert({ id: 'current', pix_config: config });
    if (sErr) {
      await supabase.from('settings').upsert({ key: 'pix_config', value: config }, { onConflict: 'key' });
    }
    return { success: true, message: 'Configuração do Pix salva com sucesso!' };
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

  async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; discountPercent: number; message: string }> {
    const cleanCode = code.trim().toUpperCase();
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', cleanCode)
        .eq('status', 'Ativo')
        .maybeSingle();

      if (!error && data) {
        const coupon = mappers.coupon(data);
        if (subtotal < coupon.minOrderValue) {
          return { valid: false, discountPercent: 0, message: `Subtotal mínimo para este cupom é R$ ${coupon.minOrderValue.toFixed(2)}.` };
        }
        if (coupon.usedCount >= coupon.maxUses) {
          return { valid: false, discountPercent: 0, message: 'Este cupom já atingiu o limite máximo de usos.' };
        }
        const isExpired = new Date(coupon.validUntil).getTime() < Date.now();
        if (isExpired) {
          return { valid: false, discountPercent: 0, message: 'Este cupom expirou.' };
        }

        const discountPercent = coupon.discountType === 'PERCENT' ? coupon.value : Math.min(100, (coupon.value / subtotal) * 100);
        return { valid: true, discountPercent, message: `Cupom ${cleanCode} validado no banco de dados! Desconto de ${coupon.value}${coupon.discountType === 'PERCENT' ? '%' : ' R$'}.` };
      }
    } catch {
      // ignore
    }

    // Built-in promotional coupons fallback
    if (cleanCode === 'ROYALE10' || cleanCode === 'VIP10' || cleanCode === 'WELCOME10') {
      return { valid: true, discountPercent: 10, message: `Cupom ${cleanCode} validado com sucesso! (10% de desconto)` };
    }
    if (cleanCode === 'DIAMOND20' || cleanCode === 'PARFUM20') {
      return { valid: true, discountPercent: 20, message: `Cupom VIP ${cleanCode} validado com sucesso! (20% de desconto)` };
    }

    return { valid: false, discountPercent: 0, message: 'Cupom inválido ou expirado.' };
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
    const { data } = await supabase.from('store_settings').select('*').limit(1).maybeSingle();
    if (data?.general_settings) return data.general_settings;
    const { data: sData } = await supabase.from('settings').select('*').eq('key', 'general_settings').maybeSingle();
    if (sData?.value) return sData.value;
    const local = localStorage.getItem('mr_general_settings');
    return local ? JSON.parse(local) : {
      storeName: 'Maison Royale',
      tagline: 'Haute Parfumerie',
      cnpj: '45.892.102/0001-88',
      phone: '+55 11 3088-2910',
      email: 'concierge@maisonroyale.com.br',
      address: 'Rua Oscar Freire, 1024 - Jardins, São Paulo - SP',
      freeShippingThreshold: 500,
      defaultShippingCost: 50,
      lowStockAlertThreshold: 5,
      currencySymbol: 'R$',
      maintenanceMode: false,
      notificationSound: true,
    };
  },

  async saveSettings(settings: GeneralSettings): Promise<{ success: boolean; message: string }> {
    localStorage.setItem('mr_general_settings', JSON.stringify(settings));
    const { error: sErr } = await supabase.from('store_settings').upsert({ id: 'current', general_settings: settings });
    if (sErr) {
      await supabase.from('settings').upsert({ key: 'general_settings', value: settings }, { onConflict: 'key' });
    }
    return { success: true, message: 'Configurações salvas com sucesso!' };
  },

  // 14. AUDIT
  async getAuditLogs(): Promise<AuditLog[]> {
    const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      return data.map(l => ({
        id: l.id,
        adminName: l.admin_name,
        adminEmail: l.admin_email,
        action: l.action,
        category: l.category,
        details: l.details,
        timestamp: l.created_at
      }));
    }
    const local = localStorage.getItem('mr_audit_logs');
    return local ? JSON.parse(local) : [];
  },

  async logAudit(adminName: string, adminEmail: string, action: string, category: any, details: string) {
    const newEntry: AuditLog = {
      id: 'log_' + Date.now(),
      adminName,
      adminEmail,
      action,
      category,
      details,
      timestamp: new Date().toISOString()
    };
    const local = localStorage.getItem('mr_audit_logs');
    const logs = local ? JSON.parse(local) : [];
    localStorage.setItem('mr_audit_logs', JSON.stringify([newEntry, ...logs.slice(0, 99)]));

    await supabase.from('audit_logs').insert({ 
      admin_name: adminName, 
      admin_email: adminEmail, 
      action, 
      category, 
      details 
    });
    window.dispatchEvent(new CustomEvent('mr_database_change'));
  },

  // 15. SUPPLIERS
  INITIAL_SUPPLIERS: [
    {
      id: 'sup_01',
      companyName: 'Atelier de Grasse Distillations SARL',
      tradeName: 'Grasse Essences de Provence',
      cnpjOrVat: 'FR-882910482',
      category: 'Essências & Óleos Nobres' as const,
      country: 'França (Grasse)',
      contactName: 'Antoine Laurent',
      email: 'antoine@grasse-distillations.fr',
      phone: '+33 4 93 36 00 22',
      website: 'https://grasse-essences.fr',
      status: 'Ativo' as const,
      paymentTerms: '30 dias líquidos após desembaraço',
      notes: 'Fornecedor principal de absolutos de rosa de maio, jasmim grandiflorum e néroli.',
      createdAt: '2026-01-05T10:00:00Z',
    },
    {
      id: 'sup_02',
      companyName: 'Vetreria Artistica Murano & Parma SpA',
      tradeName: 'Luigi Vetro Cristallo',
      cnpjOrVat: 'IT-0492819028',
      category: 'Vidraria & Frascos' as const,
      country: 'Itália (Parma)',
      contactName: 'Gianluca Rossi',
      email: 'gianluca@luigivetro.it',
      phone: '+39 0521 829100',
      website: 'https://luigivetro.it',
      status: 'Ativo' as const,
      paymentTerms: '45 dias com carta de crédito',
      notes: 'Fabricação de frascos de cristal pesado com lapidação artesanal e fundo de alto relevo.',
      createdAt: '2026-01-08T11:30:00Z',
    },
    {
      id: 'sup_03',
      companyName: 'Prestige Boxmakers & Packaging SA',
      tradeName: 'Kurtz Luxury Packaging',
      cnpjOrVat: 'CH-10928374',
      category: 'Embalagens & Estojos' as const,
      country: 'Suíça (Genebra)',
      contactName: 'Claire Dupré',
      email: 'claire@kurtzpackaging.ch',
      phone: '+41 22 798 1120',
      status: 'Ativo' as const,
      paymentTerms: '28 dias',
      notes: 'Estojos rígidos revestidos em veludo negro com gravação a quente em folha dourada 24k.',
      createdAt: '2026-01-12T14:00:00Z',
    },
  ],

  async getSuppliers(): Promise<Supplier[]> {
    const local = localStorage.getItem('mr_suppliers_cache');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {}
    }
    localStorage.setItem('mr_suppliers_cache', JSON.stringify(this.INITIAL_SUPPLIERS));
    return this.INITIAL_SUPPLIERS;
  },

  async saveSupplier(supplier: Supplier): Promise<{ success: boolean; message: string }> {
    const supId = supplier.id || 'sup_' + Date.now();
    const cleanSupplier = { ...supplier, id: supId };
    const existing = await this.getSuppliers();
    const exists = existing.some(s => s.id === supId);
    const updated = exists ? existing.map(s => s.id === supId ? cleanSupplier : s) : [cleanSupplier, ...existing];
    localStorage.setItem('mr_suppliers_cache', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('mr_database_change'));
    return { success: true, message: 'Fornecedor salvo com sucesso!' };
  },

  async deleteSupplier(id: string): Promise<{ success: boolean; message: string }> {
    const existing = await this.getSuppliers();
    const filtered = existing.filter(s => s.id !== id);
    localStorage.setItem('mr_suppliers_cache', JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('mr_database_change'));
    return { success: true, message: 'Fornecedor removido com sucesso!' };
  },

  // 16. FINANCIAL: BILLS PAYABLE & RECEIVABLE & CASH FLOW
  INITIAL_BILLS_PAYABLE: [
    {
      id: 'bp_01',
      description: 'Lote de Absoluto de Rosa Centifólia e Essências Raras',
      supplierName: 'Grasse Essences de Provence',
      category: 'Importação de Fragrâncias' as const,
      amount: 45200.0,
      dueDate: '2026-11-20',
      status: 'Pendente' as const,
      documentNumber: 'INV-FR-2026-88',
      paymentMethod: 'Swift Transfer / Câmbio',
      notes: 'Remessa internacional via porto seco de Viracopos.',
      createdAt: '2026-11-01T10:00:00Z',
    },
    {
      id: 'bp_02',
      description: 'Frascos de Cristal Lapidado 100ml — Coleção Noir Oracle',
      supplierName: 'Luigi Vetro Cristallo',
      category: 'Frascos & Vidraria' as const,
      amount: 18450.0,
      dueDate: '2026-11-15',
      status: 'Pendente' as const,
      documentNumber: 'PARMA-9102-BR',
      paymentMethod: 'Boleto Internacional',
      notes: 'Lote de 500 unidades de frascos com gravação serigráfica em ouro.',
      createdAt: '2026-11-03T11:00:00Z',
    },
    {
      id: 'bp_03',
      description: 'Aluguel & Condomínio Boutique Flagship Jardins',
      supplierName: 'Oscar Freire Empreendimentos Imobiliários',
      category: 'Boutique & Operação' as const,
      amount: 32000.0,
      dueDate: '2026-11-10',
      paymentDate: '2026-11-05',
      status: 'Pago' as const,
      documentNumber: 'OF-1024-NOV',
      paymentMethod: 'Pix',
      notes: 'Espaço boutique, mezanino de atendimento VIP e ateliê olfativo.',
      createdAt: '2026-11-01T08:00:00Z',
    },
  ],

  INITIAL_BILLS_RECEIVABLE: [
    {
      id: 'br_01',
      description: 'Pedido Corporativo VIP — Presentes de Luxo Diretoria',
      customerName: 'Banco Safra Private Banking',
      orderNumber: 'MR-9042',
      amount: 37800.0,
      dueDate: '2026-11-25',
      status: 'Pendente' as const,
      paymentMethod: 'Boleto Bancário' as const,
      notes: '20 frascos personalizados de Oud Ambre Impérial com placas em latão.',
      createdAt: '2026-11-02T15:00:00Z',
    },
    {
      id: 'br_02',
      description: 'Coleção Exclusiva Privée — Adiantamento 50%',
      customerName: 'Dra. Beatriz Albuquerque Fontes',
      orderNumber: 'MR-9018',
      amount: 9450.0,
      dueDate: '2026-11-18',
      receivedDate: '2026-11-06',
      status: 'Recebido' as const,
      paymentMethod: 'Pix' as const,
      notes: 'Fragrância sob medida formulada com íris fiorentina e oud cambojano.',
      createdAt: '2026-11-04T12:00:00Z',
    },
  ],

  async getBillsPayable(): Promise<BillPayable[]> {
    const local = localStorage.getItem('mr_bills_payable');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {}
    }
    localStorage.setItem('mr_bills_payable', JSON.stringify(this.INITIAL_BILLS_PAYABLE));
    return this.INITIAL_BILLS_PAYABLE;
  },

  async saveBillPayable(bill: BillPayable): Promise<{ success: boolean; message: string }> {
    const billId = bill.id || 'bp_' + Date.now();
    const cleanBill = { ...bill, id: billId };
    const existing = await this.getBillsPayable();
    const exists = existing.some(b => b.id === billId);
    const updated = exists ? existing.map(b => b.id === billId ? cleanBill : b) : [cleanBill, ...existing];
    localStorage.setItem('mr_bills_payable', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('mr_database_change'));
    return { success: true, message: 'Conta a pagar salva com sucesso!' };
  },

  async deleteBillPayable(id: string): Promise<{ success: boolean; message: string }> {
    const existing = await this.getBillsPayable();
    const filtered = existing.filter(b => b.id !== id);
    localStorage.setItem('mr_bills_payable', JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('mr_database_change'));
    return { success: true, message: 'Conta a pagar removida com sucesso!' };
  },

  async getBillsReceivable(): Promise<BillReceivable[]> {
    const local = localStorage.getItem('mr_bills_receivable');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {}
    }
    localStorage.setItem('mr_bills_receivable', JSON.stringify(this.INITIAL_BILLS_RECEIVABLE));
    return this.INITIAL_BILLS_RECEIVABLE;
  },

  async saveBillReceivable(bill: BillReceivable): Promise<{ success: boolean; message: string }> {
    const billId = bill.id || 'br_' + Date.now();
    const cleanBill = { ...bill, id: billId };
    const existing = await this.getBillsReceivable();
    const exists = existing.some(b => b.id === billId);
    const updated = exists ? existing.map(b => b.id === billId ? cleanBill : b) : [cleanBill, ...existing];
    localStorage.setItem('mr_bills_receivable', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('mr_database_change'));
    return { success: true, message: 'Conta a receber salva com sucesso!' };
  },

  async deleteBillReceivable(id: string): Promise<{ success: boolean; message: string }> {
    const existing = await this.getBillsReceivable();
    const filtered = existing.filter(b => b.id !== id);
    localStorage.setItem('mr_bills_receivable', JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('mr_database_change'));
    return { success: true, message: 'Conta a receber removida com sucesso!' };
  },

  async getCashFlowSummary() {
    const orders = await this.getOrders();
    const payable = await this.getBillsPayable();
    const receivable = await this.getBillsReceivable();

    const orderIncome = orders
      .filter(o => o.paymentStatus === 'Aprovado')
      .reduce((sum, o) => sum + o.total, 0);

    const receivedBills = receivable
      .filter(r => r.status === 'Recebido')
      .reduce((sum, r) => sum + r.amount, 0);

    const pendingReceivable = receivable
      .filter(r => r.status === 'Pendente' || r.status === 'Atrasado')
      .reduce((sum, r) => sum + r.amount, 0);

    const paidBills = payable
      .filter(p => p.status === 'Pago')
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingPayable = payable
      .filter(p => p.status === 'Pendente' || p.status === 'Atrasado')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalInflow = orderIncome + receivedBills;
    const totalOutflow = paidBills;
    const netBalance = totalInflow - totalOutflow;

    return {
      orderIncome,
      receivedBills,
      totalInflow,
      paidBills,
      totalOutflow,
      pendingPayable,
      pendingReceivable,
      netBalance,
      projectedBalance: netBalance + pendingReceivable - pendingPayable,
    };
  },
};
