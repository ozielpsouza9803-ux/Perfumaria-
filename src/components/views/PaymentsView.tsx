import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  FileCheck,
  Clock,
  ExternalLink,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { Database } from '../../services/database';
import { PaymentReceipt, Order, PaymentMethod } from '../../types';
import { Modal } from '../common/Modal';
import { ImageUpload } from '../common/ImageUpload';
import { useToast } from '../common/Toast';
import { useAuth } from '../../context/AuthContext';

export const PaymentsView: React.FC = () => {
  const { currentAdmin } = useAuth();
  const { success, error } = useToast();
  const [payments, setPayments] = useState<PaymentReceipt[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'Verificado' | 'Aguardando Análise' | 'Recusado'>('TODOS');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingPayment, setViewingPayment] = useState<PaymentReceipt | null>(null);

  // Form State
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<PaymentMethod>('Pix');
  const [transactionCode, setTransactionCode] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [notes, setNotes] = useState('');

  const reloadData = async () => {
    setLoading(true);
    try {
      const [paymentsData, ordersData] = await Promise.all([
        Database.getPaymentReceipts(),
        Database.getOrders(),
      ]);
      setPayments(paymentsData);
      setOrders(ordersData);
    } catch (err) {
      error('Falha ao carregar dados de pagamentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleOpenCreate = () => {
    const pendingOrder = orders.find((o) => o.paymentStatus === 'Pendente') || orders[0];
    if (pendingOrder) {
      setSelectedOrderId(pendingOrder.id);
      setAmount(pendingOrder.total);
      setMethod(pendingOrder.paymentMethod);
      setTransactionCode('PIX-' + Math.floor(100000 + Math.random() * 900000));
      setReceiptUrl('');
      setNotes('Comprovante de pagamento enviado pelo cliente.');
    }
    setIsCreateOpen(true);
  };

  const handleOrderChange = (orderId: string) => {
    setSelectedOrderId(orderId);
    const ord = orders.find((o) => o.id === orderId);
    if (ord) {
      setAmount(ord.total);
      setMethod(ord.paymentMethod);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ord = orders.find((o) => o.id === selectedOrderId);
    if (!ord) {
      error('Selecione um pedido válido.');
      return;
    }
    if (amount <= 0) {
      error('O valor deve ser maior que zero.');
      return;
    }

    const payload: PaymentReceipt = {
      id: '',
      orderId: ord.id,
      orderNumber: ord.orderNumber,
      customerName: ord.customerName,
      amount: Number(amount),
      method,
      status: 'Aguardando Análise',
      transactionCode: transactionCode.trim() || 'TRX-' + Date.now(),
      receiptUrl: receiptUrl || undefined,
      submittedAt: new Date().toISOString(),
      notes: notes.trim(),
    };

    const res = await Database.savePaymentReceipt(payload);
    if (res.success) {
      success(res.message);
      setIsCreateOpen(false);
      reloadData();
    } else {
      error(res.message);
    }
  };

  const handleVerify = async (id: string, status: 'Verificado' | 'Recusado') => {
    const adminName = currentAdmin?.name || 'Administrador';
    const ok = await Database.updatePaymentVerification(id, status, adminName);
    if (ok) {
      success(
        status === 'Verificado'
          ? 'Comprovante aprovado! Pedido vinculado atualizado para Aprovado.'
          : 'Comprovante recusado.'
      );
      reloadData();
      if (viewingPayment && viewingPayment.id === id) {
        setViewingPayment({
          ...viewingPayment,
          status,
          verifiedAt: new Date().toISOString(),
          verifiedBy: adminName,
        });
      }
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.transactionCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'TODOS' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white tracking-wide">
            Pagamentos & Conciliação de Comprovantes
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Validação de transferências Pix, conferência de comprovantes bancários e aprovação direta.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs rounded-lg shadow-md flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Anexar Comprovante</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por pedido, cliente ou código de autenticação bancária..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 w-full sm:w-auto">
          {(['TODOS', 'Aguardando Análise', 'Verificado', 'Recusado'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 font-medium">
              <th className="pb-3 pl-2">Pedido / Autenticação</th>
              <th className="pb-3">Cliente</th>
              <th className="pb-3">Forma</th>
              <th className="pb-3 text-right">Valor Pago</th>
              <th className="pb-3">Data Envio</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 pr-2 text-right">Conferência</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filteredPayments.map((p) => (
              <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                <td className="py-3 pl-2">
                  <div className="font-mono text-amber-300 font-bold">#{p.orderNumber}</div>
                  <div className="text-[10px] text-zinc-500 font-mono line-clamp-1">
                    {p.transactionCode}
                  </div>
                </td>
                <td className="py-3 font-medium text-zinc-100">{p.customerName}</td>
                <td className="py-3 text-zinc-300">{p.method}</td>
                <td className="py-3 text-right font-mono font-bold text-white tabular-nums">
                  R$ {p.amount.toFixed(2)}
                </td>
                <td className="py-3 text-zinc-400 font-mono tabular-nums">
                  {new Date(p.submittedAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="py-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                      p.status === 'Verificado'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : p.status === 'Aguardando Análise'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="py-3 pr-2 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setViewingPayment(p)}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[11px] font-medium flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Inspecionar
                    </button>
                    {p.status === 'Aguardando Análise' && (
                      <button
                        type="button"
                        onClick={() => handleVerify(p.id, 'Verificado')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold"
                      >
                        Aprovar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPayments.length === 0 && (
        <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800 rounded-xl text-zinc-500 text-xs">
          Nenhum registro de pagamento com o filtro selecionado.
        </div>
      )}

      {/* CREATE PAYMENT RECEIPT MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Anexar Comprovante de Pagamento"
        subtitle="Vincule um comprovante bancário ou código Pix ao pedido"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Pedido Vinculado <span className="text-amber-400">*</span>
            </label>
            <select
              value={selectedOrderId}
              onChange={(e) => handleOrderChange(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  Pedido #{o.orderNumber} — {o.customerName} (R$ {o.total.toFixed(2)}) [{o.paymentStatus}]
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Valor do Pagamento (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Forma de Pagamento</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              >
                <option value="Pix">Pix</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Boleto Bancário">Boleto Bancário</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Código de Autenticação / End-to-End Pix
            </label>
            <input
              type="text"
              value={transactionCode}
              onChange={(e) => setTransactionCode(e.target.value)}
              placeholder="Ex: E182361202611021605489"
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Image upload of voucher/receipt directly from device gallery */}
          <ImageUpload
            value={receiptUrl}
            onChange={(url) => setReceiptUrl(url)}
            label="Foto do Comprovante Bancário"
            hint="Envie a foto ou print do comprovante salvo na galeria do seu dispositivo"
          />

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Observações do Concierge</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instruções adicionais..."
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400 resize-none"
            />
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
              Salvar Comprovante
            </button>
          </div>
        </form>
      </Modal>

      {/* INSPECT VOUCHER MODAL */}
      {viewingPayment && (
        <Modal
          isOpen={!!viewingPayment}
          onClose={() => setViewingPayment(null)}
          title={`Comprovante do Pedido #${viewingPayment.orderNumber}`}
          subtitle={`Autenticação: ${viewingPayment.transactionCode}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-500">Cliente Comprador:</span>
                <span className="text-zinc-200 font-medium">{viewingPayment.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Valor Declarado:</span>
                <span className="font-mono text-base font-bold text-amber-300 tabular-nums">
                  R$ {viewingPayment.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Método de Liquidação:</span>
                <span className="text-zinc-200">{viewingPayment.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Situação:</span>
                <span className="font-semibold text-amber-300">{viewingPayment.status}</span>
              </div>
              {viewingPayment.verifiedAt && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Aprovado Por:</span>
                  <span className="text-zinc-300">
                    {viewingPayment.verifiedBy} em{' '}
                    {new Date(viewingPayment.verifiedAt).toLocaleString('pt-BR')}
                  </span>
                </div>
              )}
            </div>

            {/* Receipt Image / Proof view */}
            {viewingPayment.receiptUrl ? (
              <div className="border border-zinc-800 rounded-lg overflow-hidden bg-black p-2 flex justify-center max-h-72">
                <img
                  src={viewingPayment.receiptUrl}
                  alt="Comprovante"
                  className="max-h-64 object-contain rounded"
                />
              </div>
            ) : (
              <div className="p-6 text-center rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-500">
                <FileCheck className="w-8 h-8 mx-auto text-zinc-600 mb-1" />
                <span>Nenhuma imagem de comprovante anexada fisicamente (Autenticação eletrônica via chave Pix).</span>
              </div>
            )}

            {viewingPayment.notes && (
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400">
                Nota: {viewingPayment.notes}
              </div>
            )}

            {/* Verification Actions */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {viewingPayment.status !== 'Verificado' && (
                  <button
                    type="button"
                    onClick={() => handleVerify(viewingPayment.id, 'Verificado')}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aprovar Pagamento</span>
                  </button>
                )}
                {viewingPayment.status !== 'Recusado' && (
                  <button
                    type="button"
                    onClick={() => handleVerify(viewingPayment.id, 'Recusado')}
                    className="px-3.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Recusar</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setViewingPayment(null)}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg"
              >
                Fechar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
