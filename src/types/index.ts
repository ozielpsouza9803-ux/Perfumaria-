export type AdminRole = 'SUPER_ADMIN' | 'GERENTE' | 'ESTOQUISTA' | 'CONSULTOR';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  phone?: string;
  avatar?: string;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
  token?: string;
  expiresAt?: number;
}

export interface Brand {
  id: string;
  name: string;
  country: string;
  description: string;
  foundedYear: number;
  status: 'Ativa' | 'Inativa';
  logoUrl?: string;
  website?: string;
}

export type OlfactoryFamily =
  | 'Amadeirado'
  | 'Oriental & Âmbar'
  | 'Floral Nobre'
  | 'Cítrico & Fresco'
  | 'Chipre Frutado'
  | 'Gourmand'
  | 'Couro & Tabaco';

export type FragranceConcentration =
  | 'Extrait de Parfum'
  | 'Eau de Parfum'
  | 'Eau de Toilette'
  | 'Eau de Cologne'
  | 'Attar Puro';

export interface Product {
  id: string;
  sku: string;
  name: string;
  brandId: string;
  brandName?: string;
  olfactoryFamily: OlfactoryFamily;
  concentration: FragranceConcentration;
  volumeMl: number;
  purchasePrice: number;
  salePrice: number;
  stockQuantity: number;
  minStockAlert: number;
  image: string;
  status: 'Ativo' | 'Rascunho' | 'Esgotado';
  description: string;
  topNotes: string; // Notas de topo/saída
  heartNotes: string; // Notas de coração/corpo
  baseNotes: string; // Notas de fundo/base
  createdAt: string;
  updatedAt: string;
}

export type MovementType = 'ENTRADA' | 'SAIDA' | 'AJUSTE';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  unitCost: number;
  reason: string;
  documentRef?: string;
  adminName: string;
  date: string;
}

export type CustomerVipTier = 'Standard' | 'Gold VIP' | 'Diamond Club';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  city: string;
  state: string;
  address?: string;
  vipTier: CustomerVipTier;
  totalSpent: number;
  ordersCount: number;
  notes?: string;
  createdAt: string;
}

export type AppointmentStatus = 'Agendado' | 'Em Atendimento' | 'Concluído' | 'Cancelado';

export interface CustomerAppointment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceType:
    | 'Consultoria Olfativa Exclusiva'
    | 'Degustação de Fragrâncias Raras'
    | 'Personalização de Frascos & Gravação'
    | 'Atendimento VIP Private Room';
  date: string;
  time: string;
  consultant: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  sku: string;
  productName: string;
  volumeMl: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type PaymentMethod = 'Pix' | 'Cartão de Crédito' | 'Boleto Bancário';
export type PaymentStatus = 'Aprovado' | 'Pendente' | 'Cancelado';
export type FulfillmentStatus = 'Aguardando Pagamento' | 'Em Separação' | 'Enviado' | 'Entregue' | 'Cancelado';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  trackingCode?: string;
  shippingAddress: string;
  notes?: string;
  createdAt: string;
}

export interface PaymentReceipt {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  method: PaymentMethod;
  status: 'Verificado' | 'Aguardando Análise' | 'Recusado';
  transactionCode: string;
  receiptUrl?: string; // base64 or link
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
}

export interface PixConfig {
  keyType: 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM';
  pixKey: string;
  beneficiaryName: string;
  bankName: string;
  city: string;
  active: boolean;
  instructions: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENT' | 'FIXED';
  value: number;
  minOrderValue: number;
  maxUses: number;
  usedCount: number;
  validUntil: string;
  status: 'Ativo' | 'Inativo' | 'Expirado';
  createdAt: string;
}

export interface GeneralSettings {
  storeName: string;
  tagline: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  freeShippingThreshold: number;
  defaultShippingCost: number;
  lowStockAlertThreshold: number;
  currencySymbol: string;
  maintenanceMode: boolean;
  notificationSound: boolean;
}

export interface AuditLog {
  id: string;
  adminName: string;
  adminEmail: string;
  action: string;
  category: 'AUTENTICAÇÃO' | 'PRODUTO' | 'ESTOQUE' | 'PEDIDO' | 'CONFIGURAÇÃO' | 'SISTEMA';
  details: string;
  timestamp: string;
}

export interface Supplier {
  id: string;
  companyName: string;
  tradeName: string;
  cnpjOrVat: string;
  category: 'Essências & Óleos Nobres' | 'Vidraria & Frascos' | 'Válvulas & Atomizadores' | 'Embalagens & Estojos' | 'Insumos de Laboratório';
  country: string;
  contactName: string;
  email: string;
  phone: string;
  website?: string;
  status: 'Ativo' | 'Em Homologação' | 'Inativo';
  paymentTerms: string;
  notes?: string;
  createdAt: string;
}

export interface BillPayable {
  id: string;
  description: string;
  supplierId?: string;
  supplierName: string;
  category: 'Importação de Fragrâncias' | 'Insumos de Grasse' | 'Frascos & Vidraria' | 'Logística Internacional' | 'Boutique & Operação' | 'Marketing';
  amount: number;
  dueDate: string;
  paymentDate?: string;
  status: 'Pendente' | 'Pago' | 'Atrasado';
  documentNumber?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
}

export interface BillReceivable {
  id: string;
  description: string;
  customerId?: string;
  customerName: string;
  orderId?: string;
  orderNumber?: string;
  amount: number;
  dueDate: string;
  receivedDate?: string;
  status: 'Pendente' | 'Recebido' | 'Atrasado';
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export type AdminModule =
  | 'dashboard'
  | 'cadastros'
  | 'produtos'
  | 'estoque'
  | 'vendas'
  | 'financeiro'
  | 'marketing'
  | 'agenda'
  | 'relatorios'
  | 'seguranca';

