import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Eye,
  Trash2,
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  Tag,
  DollarSign,
  AlertCircle,
  X,
} from 'lucide-react';
import { Database } from '../../services/database';
import {
  Order,
  OrderItem,
  Product,
  Customer,
  PaymentMethod,
  PaymentStatus,
  FulfillmentStatus,
} from '../../types';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';

export const OrdersView: React.FC = () => {
  const { success, error } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | PaymentStatus>('TODOS');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<'TODOS' | FulfillmentStatus>('TODOS');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [editingStatusOrder, setEditingStatusOrder] = useState<Order | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // New Order Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedItems, setSelectedItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [discountValue, setDiscountValue] = useState(0);
  const [shippingValue, setShippingValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pix');
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Status edit form
  const [newPayStatus, setNewPayStatus] = useState<PaymentStatus>('Pendente');
  const [newFulStatus, setNewFulStatus] = useState<FulfillmentStatus>('Aguardando Pagamento');
  const [newTrackingCode, setNewTrackingCode] = useState('');

  const reloadData = async () => {
    setLoading(true);
    try {
      const [ordersData, productsData, customersData] = await Promise.all([
        Database.getOrders(),
        Database.getProducts(),
        Database.getCustomers(),
      ]);
      setOrders(ordersData);
      setProducts(productsData);
      setCustomers(customersData);
    } catch (err) {
      error('Falha ao carregar dados de pedidos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleOpenCreate = () => {
    const firstCust = customers[0];
    setSelectedCustomerId(firstCust?.id || '');
    setShippingAddress(firstCust?.address ? `${firstCust.address}, ${firstCust.city}/${firstCust.state}` : '');
    const firstProd = products[0];
    setSelectedItems(firstProd ? [{ productId: firstProd.id, quantity: 1 }] : []);
    setDiscountValue(0);
    setShippingValue(0);
    setPaymentMethod('Pix');
    setOrderNotes('Pedido gerado diretamente pela boutique Maison Royale.');
    setIsCreateOpen(true);
  };

  const handleCustomerChange = (custId: string) => {
    setSelectedCustomerId(custId);
    const c = customers.find((x) => x.id === custId);
    if (c) {
      setShippingAddress(c.address ? `${c.address}, ${c.city}/${c.state}` : `${c.city}/${c.state}`);
    }
  };

  const handleAddItem = () => {
    const available = products.find((p) => !selectedItems.some((i) => i.productId === p.id));
    if (available) {
      setSelectedItems([...selectedItems, { productId: available.id, quantity: 1 }]);
    } else if (products[0]) {
      setSelectedItems([...selectedItems, { productId: products[0].id, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, idx) => idx !== index));
  };

  const handleItemProductChange = (index: number, prodId: string) => {
    const updated = [...selectedItems];
    updated[index].productId = prodId;
    setSelectedItems(updated);
  };

  const handleItemQuantityChange = (index: number, qty: number) => {
    const updated = [...selectedItems];
    updated[index].quantity = Math.max(1, qty);
    setSelectedItems(updated);
  };

  // Live order calculations
  const orderItemsCalculated: OrderItem[] = selectedItems.map((item) => {
    const p = products.find((prod) => prod.id === item.productId);
    const price = p ? p.salePrice : 0;
    return {
      productId: item.productId,
      sku: p?.sku || 'SKU',
      productName: p?.name || 'Perfume',
      volumeMl: p?.volumeMl || 100,
      quantity: item.quantity,
      unitPrice: price,
      totalPrice: price * item.quantity,
    };
  });

  const subtotal = orderItemsCalculated.reduce((acc, i) => acc + i.totalPrice, 0);
  const totalOrder = Math.max(0, subtotal - Number(discountValue) + Number(shippingValue));

  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === selectedCustomerId);
    if (!cust) {
      error('Selecione um cliente válido para o pedido.');
      return;
    }
    if (orderItemsCalculated.length === 0) {
      error('Adicione ao menos um perfume no pedido.');
      return;
    }

    // Verify stock
    for (const item of orderItemsCalculated) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod && prod.stockQuantity < item.quantity) {
        error(`Estoque insuficiente de ${prod.name}! Saldo disponível: ${prod.stockQuantity} frascos.`);
        return;
      }
    }

    const newOrder: Order = {
      id: '',
      orderNumber: '',
      customerId: cust.id,
      customerName: cust.name,
      customerEmail: cust.email,
      customerPhone: cust.phone,
      items: orderItemsCalculated,
      subtotal,
      discount: Number(discountValue),
      shipping: Number(shippingValue),
      total: totalOrder,
      paymentMethod,
      paymentStatus: paymentMethod === 'Pix' ? 'Aprovado' : 'Pendente',
      fulfillmentStatus: 'Em Separação',
      shippingAddress: shippingAddress.trim() || 'Retirada no Ateliê',
      notes: orderNotes.trim(),
      createdAt: new Date().toISOString(),
    };

    const res = await Database.saveOrder(newOrder);
    if (res.success) {
      success(res.message);
      setIsCreateOpen(false);
      reloadData();
    } else {
      error(res.message);
    }
  };

  const handleOpenStatusEdit = (ord: Order) => {
    setEditingStatusOrder(ord);
    setNewPayStatus(ord.paymentStatus);
    setNewFulStatus(ord.fulfillmentStatus);
    setNewTrackingCode(ord.trackingCode || '');
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStatusOrder) return;
    const ok = await Database.updateOrderStatus(
      editingStatusOrder.id,
      newPayStatus,
      newFulStatus,
      newTrackingCode.trim()
    );
    if (ok) {
      success(`Status do Pedido #${editingStatusOrder.orderNumber} atualizado com êxito!`);
      setEditingStatusOrder(null);
      reloadData();
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    const res = await Database.deleteOrder(deletingId);
    if (res.success) {
      success(res.message);
      reloadData();
    }
    setDeletingId(null);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.trackingCode && o.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPay = statusFilter === 'TODOS' || o.paymentStatus === statusFilter;
    const matchesFul = fulfillmentFilter === 'TODOS' || o.fulfillmentStatus === fulfillmentFilter;
    return matchesSearch && matchesPay && matchesFul;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white tracking-wide">
            Gestão & Despacho de Pedidos
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Controle de liquidação de pagamentos, separação de frascos, códigos de rastreio e notas.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs rounded-lg shadow-md flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Pedido</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nº do pedido (ex: MR-2041), cliente ou código de rastreio..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'TODOS' | PaymentStatus)}
            className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-amber-400"
          >
            <option value="TODOS">Pagamento: Todos</option>
            <option value="Aprovado">Aprovado</option>
            <option value="Pendente">Pendente</option>
            <option value="Cancelado">Cancelado</option>
          </select>

          <select
            value={fulfillmentFilter}
            onChange={(e) =>
              setFulfillmentFilter(e.target.value as 'TODOS' | FulfillmentStatus)
            }
            className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-amber-400"
          >
            <option value="TODOS">Logística: Todos</option>
            <option value="Aguardando Pagamento">Aguardando Pagamento</option>
            <option value="Em Separação">Em Separação</option>
            <option value="Enviado">Enviado</option>
            <option value="Entregue">Entregue</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 font-medium">
              <th className="pb-3 pl-2">Pedido / Data</th>
              <th className="pb-3">Cliente</th>
              <th className="pb-3">Itens Adquiridos</th>
              <th className="pb-3 text-right">Total</th>
              <th className="pb-3">Forma Pgto</th>
              <th className="pb-3">Pagamento</th>
              <th className="pb-3">Status Envio</th>
              <th className="pb-3 pr-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filteredOrders.map((ord) => (
              <tr key={ord.id} className="hover:bg-zinc-800/40 transition-colors">
                <td className="py-3 pl-2 whitespace-nowrap">
                  <div className="font-mono text-amber-300 font-bold">#{ord.orderNumber}</div>
                  <div className="text-[10px] text-zinc-500 font-mono">
                    {new Date(ord.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </td>
                <td className="py-3">
                  <div className="font-medium text-zinc-100">{ord.customerName}</div>
                  <div className="text-[11px] text-zinc-400">{ord.customerEmail}</div>
                </td>
                <td className="py-3">
                  <div className="text-zinc-300 line-clamp-1">
                    {ord.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    {ord.items.reduce((acc, i) => acc + i.quantity, 0)} frasco(s) total
                  </div>
                </td>
                <td className="py-3 text-right font-mono font-bold text-white tabular-nums whitespace-nowrap">
                  R$ {ord.total.toFixed(2)}
                </td>
                <td className="py-3 text-zinc-300 whitespace-nowrap">{ord.paymentMethod}</td>
                <td className="py-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                      ord.paymentStatus === 'Aprovado'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : ord.paymentStatus === 'Pendente'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {ord.paymentStatus}
                  </span>
                </td>
                <td className="py-3 whitespace-nowrap">
                  <span className="text-zinc-300 text-[11px] block">{ord.fulfillmentStatus}</span>
                  {ord.trackingCode && (
                    <span className="text-[10px] font-mono text-amber-400 block">
                      Rastreio: {ord.trackingCode}
                    </span>
                  )}
                </td>
                <td className="py-3 pr-2 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setViewingOrder(ord)}
                      className="p-1.5 text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 rounded transition-colors"
                      title="Ver Fatura / Recibo"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenStatusEdit(ord)}
                      className="p-1.5 text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 rounded transition-colors"
                      title="Alterar Status e Rastreio"
                    >
                      <Truck className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(ord.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      title="Excluir Pedido"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredOrders.length === 0 && (
        <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800 rounded-xl text-zinc-500 text-xs">
          Nenhum pedido encontrado com os filtros selecionados.
        </div>
      )}

      {/* CREATE ORDER MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Novo Pedido de Alta Perfumaria"
        subtitle="Venda direta com baixa automática de estoque e cálculo de valores"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveOrder} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Cliente Comprador <span className="text-amber-400">*</span>
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.vipTier} ({c.email})
                </option>
              ))}
            </select>
          </div>

          {/* Items selection */}
          <div className="space-y-2 p-3 bg-zinc-950 rounded-lg border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-300 uppercase tracking-wide">
                Frascos do Pedido
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Outro Frasco
              </button>
            </div>

            <div className="space-y-2">
              {selectedItems.map((item, idx) => {
                const prod = products.find((p) => p.id === item.productId);
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 bg-zinc-900 rounded border border-zinc-800 text-xs"
                  >
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemProductChange(idx, e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-zinc-200"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.volumeMl}ml) — R$ {p.salePrice.toFixed(2)} [Estoque: {p.stockQuantity}]
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1">
                      <span className="text-zinc-500 text-[11px]">Qtd:</span>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleItemQuantityChange(idx, Number(e.target.value))}
                        className="w-16 px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-center text-zinc-100 font-mono"
                      />
                    </div>

                    <div className="w-24 text-right font-mono font-bold text-amber-300 tabular-nums">
                      R$ {((prod?.salePrice || 0) * item.quantity).toFixed(2)}
                    </div>

                    {selectedItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 text-zinc-500 hover:text-rose-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing & Discounts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Forma de Pagamento</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              >
                <option value="Pix">Pix Instantâneo (Recomendado)</option>
                <option value="Cartão de Crédito">Cartão de Crédito (Até 10x)</option>
                <option value="Boleto Bancário">Boleto Bancário VIP</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Desconto Aplicado (R$)</label>
              <input
                type="number"
                min={0}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Frete / Envio (R$)</label>
              <input
                type="number"
                min={0}
                value={shippingValue}
                onChange={(e) => setShippingValue(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Endereço de Entrega</label>
            <input
              type="text"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Endereço completo para remessa segura"
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Total summary bar */}
          <div className="p-3 bg-zinc-950 rounded-lg border border-amber-500/30 flex items-center justify-between text-xs">
            <div>
              <span className="text-zinc-500">Subtotal: R$ {subtotal.toFixed(2)}</span>
              {discountValue > 0 && <span className="text-rose-400 ml-2">-R$ {discountValue.toFixed(2)}</span>}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 uppercase tracking-wide font-medium">Total do Pedido:</span>
              <span className="font-mono text-base font-bold text-amber-300 tabular-nums">
                R$ {totalOrder.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Finalizar e Emitir Pedido
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT STATUS & TRACKING MODAL */}
      {editingStatusOrder && (
        <Modal
          isOpen={!!editingStatusOrder}
          onClose={() => setEditingStatusOrder(null)}
          title={`Atualizar Status — Pedido #${editingStatusOrder.orderNumber}`}
          subtitle={`Cliente: ${editingStatusOrder.customerName}`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveStatus} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Status do Pagamento
              </label>
              <select
                value={newPayStatus}
                onChange={(e) => setNewPayStatus(e.target.value as PaymentStatus)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              >
                <option value="Aprovado">Aprovado (Pagamento verificado)</option>
                <option value="Pendente">Pendente (Aguardando comprovante / compensação)</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Status de Expedição & Entrega
              </label>
              <select
                value={newFulStatus}
                onChange={(e) => setNewFulStatus(e.target.value as FulfillmentStatus)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              >
                <option value="Aguardando Pagamento">Aguardando Pagamento</option>
                <option value="Em Separação">Em Separação no Ateliê</option>
                <option value="Enviado">Enviado (Em trânsito)</option>
                <option value="Entregue">Entregue com Sucesso</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Código de Rastreamento (Correios / Sedex / Courier)
              </label>
              <input
                type="text"
                value={newTrackingCode}
                onChange={(e) => setNewTrackingCode(e.target.value.toUpperCase())}
                placeholder="Ex: BR-98421098X"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setEditingStatusOrder(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* VIEW ORDER INVOICE MODAL */}
      {viewingOrder && (
        <Modal
          isOpen={!!viewingOrder}
          onClose={() => setViewingOrder(null)}
          title={`Recibo do Pedido #${viewingOrder.orderNumber}`}
          subtitle={`Maison Royale Parfumerie · Emissão: ${new Date(viewingOrder.createdAt).toLocaleString('pt-BR')}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Customer & Order details header */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-zinc-950 rounded-lg border border-zinc-800">
              <div>
                <span className="text-[11px] text-zinc-500 uppercase block">Dados do Cliente</span>
                <div className="font-semibold text-zinc-200 mt-0.5">{viewingOrder.customerName}</div>
                <div className="text-zinc-400">{viewingOrder.customerEmail}</div>
                <div className="text-zinc-400">{viewingOrder.customerPhone}</div>
              </div>
              <div>
                <span className="text-[11px] text-zinc-500 uppercase block">Entrega & Cobrança</span>
                <div className="text-zinc-300 mt-0.5">{viewingOrder.shippingAddress}</div>
                <div className="text-amber-400 font-medium mt-1">Forma: {viewingOrder.paymentMethod}</div>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border border-zinc-800 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="py-2 px-3">Frasco</th>
                    <th className="py-2 px-3 text-center">Volume</th>
                    <th className="py-2 px-3 text-center">Qtd</th>
                    <th className="py-2 px-3 text-right">Preço Unit.</th>
                    <th className="py-2 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {viewingOrder.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-950/50">
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-zinc-200">{item.productName}</div>
                        <div className="font-mono text-[10px] text-zinc-500">{item.sku}</div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-zinc-400">
                        {item.volumeMl}ml
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-zinc-200">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-zinc-300 tabular-nums">
                        R$ {item.unitPrice.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-300 tabular-nums">
                        R$ {item.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Breakdown */}
            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1 text-right">
              <div className="text-zinc-400">
                Subtotal: <span className="font-mono text-zinc-200">R$ {viewingOrder.subtotal.toFixed(2)}</span>
              </div>
              {viewingOrder.discount > 0 && (
                <div className="text-rose-400">
                  Desconto ({viewingOrder.couponCode || 'Manual'}):{' '}
                  <span className="font-mono">-R$ {viewingOrder.discount.toFixed(2)}</span>
                </div>
              )}
              {viewingOrder.shipping > 0 && (
                <div className="text-zinc-400">
                  Frete:{' '}
                  <span className="font-mono text-zinc-200">R$ {viewingOrder.shipping.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-zinc-800 text-sm font-bold text-amber-300 flex justify-between">
                <span className="text-zinc-300 uppercase">Valor Total do Pedido:</span>
                <span className="font-mono tabular-nums">R$ {viewingOrder.total.toFixed(2)}</span>
              </div>
            </div>

            {viewingOrder.notes && (
              <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-800 text-[11px] text-zinc-400">
                Observações: {viewingOrder.notes}
              </div>
            )}

            <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Recibo</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg"
              >
                Fechar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Excluir Pedido"
        message="Deseja remover este pedido? A exclusão removerá o registro contábil deste pedido da base de dados."
        confirmLabel="Sim, Excluir Pedido"
      />
    </div>
  );
};
