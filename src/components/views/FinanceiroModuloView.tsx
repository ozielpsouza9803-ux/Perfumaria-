import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  QrCode,
  Calendar,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Edit3,
  Building,
  CreditCard,
  PieChart,
} from 'lucide-react';
import { Database } from '../../services/database';
import { BillPayable, BillReceivable, PaymentMethod } from '../../types';
import { PaymentsView } from './PaymentsView';
import { PixConfigView } from './PixConfigView';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';

export type FinanceiroSubTab =
  | 'fluxo'
  | 'contas_pagar'
  | 'contas_receber'
  | 'comprovantes'
  | 'formas_pix';

interface FinanceiroModuloViewProps {
  initialSubTab?: FinanceiroSubTab;
}

export const FinanceiroModuloView: React.FC<FinanceiroModuloViewProps> = ({
  initialSubTab = 'fluxo',
}) => {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<FinanceiroSubTab>(initialSubTab);

  const [cashFlow, setCashFlow] = useState<any>(null);
  const [billsPayable, setBillsPayable] = useState<BillPayable[]>([]);
  const [billsReceivable, setBillsReceivable] = useState<BillReceivable[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals for Bills Payable
  const [isPayableModalOpen, setIsPayableModalOpen] = useState(false);
  const [editingPayable, setEditingPayable] = useState<BillPayable | null>(null);
  const [payableFormData, setPayableFormData] = useState<Omit<BillPayable, 'id' | 'createdAt'>>({
    description: '',
    supplierName: '',
    category: 'Importação de Fragrâncias',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    status: 'Pendente',
    documentNumber: '',
    paymentMethod: 'Pix',
    notes: '',
  });

  // Modals for Bills Receivable
  const [isReceivableModalOpen, setIsReceivableModalOpen] = useState(false);
  const [editingReceivable, setEditingReceivable] = useState<BillReceivable | null>(null);
  const [receivableFormData, setReceivableFormData] = useState<Omit<BillReceivable, 'id' | 'createdAt'>>({
    description: '',
    customerName: '',
    orderNumber: '',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    status: 'Pendente',
    paymentMethod: 'Pix',
    notes: '',
  });

  // Deletion state
  const [deletingType, setDeletingType] = useState<'payable' | 'receivable' | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reloadData = async () => {
    setLoading(true);
    try {
      const [cf, bp, br] = await Promise.all([
        Database.getCashFlowSummary(),
        Database.getBillsPayable(),
        Database.getBillsReceivable(),
      ]);
      setCashFlow(cf);
      setBillsPayable(bp);
      setBillsReceivable(br);
    } catch (err) {
      error('Falha ao sincronizar dados financeiros.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
    window.addEventListener('mr_database_change', reloadData);
    return () => window.removeEventListener('mr_database_change', reloadData);
  }, []);

  // Save Bill Payable
  const handleSavePayable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payableFormData.description.trim() || payableFormData.amount <= 0) {
      error('Preencha a descrição e um valor válido para a despesa.');
      return;
    }

    const payload: BillPayable = {
      id: editingPayable ? editingPayable.id : '',
      description: payableFormData.description.trim(),
      supplierName: payableFormData.supplierName.trim() || 'Fornecedor Diversos',
      category: payableFormData.category,
      amount: Number(payableFormData.amount),
      dueDate: payableFormData.dueDate,
      paymentDate: payableFormData.paymentDate,
      status: payableFormData.status,
      documentNumber: payableFormData.documentNumber?.trim(),
      paymentMethod: payableFormData.paymentMethod,
      notes: payableFormData.notes?.trim(),
      createdAt: editingPayable ? editingPayable.createdAt : new Date().toISOString(),
    };

    const res = await Database.saveBillPayable(payload);
    if (res.success) {
      success(res.message);
      setIsPayableModalOpen(false);
      reloadData();
    } else {
      error(res.message);
    }
  };

  // Save Bill Receivable
  const handleSaveReceivable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivableFormData.description.trim() || receivableFormData.amount <= 0) {
      error('Preencha a descrição e um valor válido para o recebível.');
      return;
    }

    const payload: BillReceivable = {
      id: editingReceivable ? editingReceivable.id : '',
      description: receivableFormData.description.trim(),
      customerName: receivableFormData.customerName.trim() || 'Cliente VIP',
      orderNumber: receivableFormData.orderNumber?.trim(),
      amount: Number(receivableFormData.amount),
      dueDate: receivableFormData.dueDate,
      receivedDate: receivableFormData.receivedDate,
      status: receivableFormData.status,
      paymentMethod: receivableFormData.paymentMethod,
      notes: receivableFormData.notes?.trim(),
      createdAt: editingReceivable ? editingReceivable.createdAt : new Date().toISOString(),
    };

    const res = await Database.saveBillReceivable(payload);
    if (res.success) {
      success(res.message);
      setIsReceivableModalOpen(false);
      reloadData();
    } else {
      error(res.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId || !deletingType) return;
    if (deletingType === 'payable') {
      const res = await Database.deleteBillPayable(deletingId);
      if (res.success) success(res.message);
      else error(res.message);
    } else if (deletingType === 'receivable') {
      const res = await Database.deleteBillReceivable(deletingId);
      if (res.success) success(res.message);
      else error(res.message);
    }
    setDeletingType(null);
    setDeletingId(null);
    reloadData();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white tracking-wide">
            Módulo 6: Gestão Financeira & Tesouraria
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Fluxo de caixa consolidado, liquidação de faturas de importação, faturamento VIP e auditoria Pix.
          </p>
        </div>

        {activeTab === 'contas_pagar' && (
          <button
            type="button"
            onClick={() => {
              setEditingPayable(null);
              setPayableFormData({
                description: '',
                supplierName: '',
                category: 'Importação de Fragrâncias',
                amount: 0,
                dueDate: new Date().toISOString().split('T')[0],
                status: 'Pendente',
                documentNumber: '',
                paymentMethod: 'Pix',
                notes: '',
              });
              setIsPayableModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs rounded-lg shadow-md flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Conta a Pagar</span>
          </button>
        )}

        {activeTab === 'contas_receber' && (
          <button
            type="button"
            onClick={() => {
              setEditingReceivable(null);
              setReceivableFormData({
                description: '',
                customerName: '',
                orderNumber: '',
                amount: 0,
                dueDate: new Date().toISOString().split('T')[0],
                status: 'Pendente',
                paymentMethod: 'Pix',
                notes: '',
              });
              setIsReceivableModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs rounded-lg shadow-md flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Conta a Receber</span>
          </button>
        )}
      </div>

      {/* Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('fluxo')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'fluxo'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Fluxo de Caixa</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contas_pagar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'contas_pagar'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span>Contas a Pagar ({billsPayable.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contas_receber')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'contas_receber'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Contas a Receber ({billsReceivable.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('comprovantes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'comprovantes'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Pagamentos Recebidos & Comprovantes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('formas_pix')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'formas_pix'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Configuração Pix & Banco</span>
        </button>
      </div>

      {/* TAB 1: FLUXO DE CAIXA */}
      {activeTab === 'fluxo' && cashFlow && (
        <div className="space-y-6">
          {/* Metrics summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
              <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Entradas Realizadas
              </span>
              <div className="text-xl font-serif font-bold text-emerald-300 font-mono">
                R$ {cashFlow.totalInflow.toFixed(2)}
              </div>
              <span className="text-[10px] text-zinc-500 block">Vendas boutique e recebíveis liquidados</span>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
              <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                Saídas Realizadas
              </span>
              <div className="text-xl font-serif font-bold text-rose-300 font-mono">
                R$ {cashFlow.totalOutflow.toFixed(2)}
              </div>
              <span className="text-[10px] text-zinc-500 block">Insumos, frascos e despesas operacionais</span>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
              <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-amber-400" />
                Saldo Operacional Líquido
              </span>
              <div
                className={`text-xl font-serif font-bold font-mono ${
                  cashFlow.netBalance >= 0 ? 'text-amber-300' : 'text-rose-400'
                }`}
              >
                R$ {cashFlow.netBalance.toFixed(2)}
              </div>
              <span className="text-[10px] text-zinc-500 block">Disponibilidade consolidada em conta</span>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900/80 border border-amber-500/30 bg-amber-500/5 space-y-1.5">
              <span className="text-xs text-amber-300 font-medium flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-amber-400" />
                Projeção Futura (30 Dias)
              </span>
              <div className="text-xl font-serif font-bold text-amber-200 font-mono">
                R$ {cashFlow.projectedBalance.toFixed(2)}
              </div>
              <span className="text-[10px] text-zinc-400 block">Saldo líquido + a receber - a pagar</span>
            </div>
          </div>

          {/* Quick pending comparison bar */}
          <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Contas a Pagar Pendentes:</span>
                <span className="font-mono font-bold text-rose-400">
                  R$ {cashFlow.pendingPayable.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
                <div className="bg-rose-500 h-full w-2/3" />
              </div>
              <span className="text-[10px] text-zinc-500">
                Lotes de essências de Grasse e frascos italianos aguardando vencimento.
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Contas a Receber Pendentes:</span>
                <span className="font-mono font-bold text-emerald-400">
                  R$ {cashFlow.pendingReceivable.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
                <div className="bg-emerald-500 h-full w-4/5" />
              </div>
              <span className="text-[10px] text-zinc-500">
                Faturamentos corporativos Safra VIP e cartões de crédito em processamento.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONTAS A PAGAR */}
      {activeTab === 'contas_pagar' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {billsPayable.map((bp) => {
              const isPaid = bp.status === 'Pago';
              return (
                <div
                  key={bp.id}
                  className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-[10px] font-medium text-amber-400 uppercase tracking-wider block">
                          {bp.category}
                        </span>
                        <h4 className="font-serif text-sm font-semibold text-white group-hover:text-amber-200 transition-colors mt-0.5">
                          {bp.description}
                        </h4>
                        <span className="text-xs text-zinc-400 block mt-0.5">{bp.supplierName}</span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 ${
                          isPaid
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {bp.status}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Vencimento</span>
                        <span className="font-mono text-zinc-300">
                          {new Date(bp.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 block">Valor a Liquidar</span>
                        <span className="font-mono font-bold text-rose-300">
                          R$ {bp.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-zinc-800/60">
                    <button
                      type="button"
                      onClick={async () => {
                        await Database.saveBillPayable({
                          ...bp,
                          status: isPaid ? 'Pendente' : 'Pago',
                          paymentDate: isPaid ? undefined : new Date().toISOString().split('T')[0],
                        });
                        success(`Conta marcada como ${isPaid ? 'Pendente' : 'Paga'}!`);
                        reloadData();
                      }}
                      className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isPaid ? 'Reabrir Fatura' : 'Marcar como Pago'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPayable(bp);
                          setPayableFormData({
                            description: bp.description,
                            supplierName: bp.supplierName,
                            category: bp.category,
                            amount: bp.amount,
                            dueDate: bp.dueDate,
                            paymentDate: bp.paymentDate,
                            status: bp.status,
                            documentNumber: bp.documentNumber || '',
                            paymentMethod: bp.paymentMethod || 'Pix',
                            notes: bp.notes || '',
                          });
                          setIsPayableModalOpen(true);
                        }}
                        className="p-1.5 text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Editar Conta"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeletingType('payable');
                          setDeletingId(bp.id);
                        }}
                        className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Excluir Conta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CONTAS A RECEBER */}
      {activeTab === 'contas_receber' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {billsReceivable.map((br) => {
              const isReceived = br.status === 'Recebido';
              return (
                <div
                  key={br.id}
                  className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-[10px] font-medium text-amber-400 uppercase tracking-wider block">
                          Recebível VIP
                        </span>
                        <h4 className="font-serif text-sm font-semibold text-white group-hover:text-amber-200 transition-colors mt-0.5">
                          {br.description}
                        </h4>
                        <span className="text-xs text-zinc-400 block mt-0.5">{br.customerName}</span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 ${
                          isReceived
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {br.status}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Vencimento</span>
                        <span className="font-mono text-zinc-300">
                          {new Date(br.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 block">Valor a Receber</span>
                        <span className="font-mono font-bold text-emerald-300">
                          R$ {br.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-zinc-800/60">
                    <button
                      type="button"
                      onClick={async () => {
                        await Database.saveBillReceivable({
                          ...br,
                          status: isReceived ? 'Pendente' : 'Recebido',
                          receivedDate: isReceived ? undefined : new Date().toISOString().split('T')[0],
                        });
                        success(`Recebível marcado como ${isReceived ? 'Pendente' : 'Recebido'}!`);
                        reloadData();
                      }}
                      className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isReceived ? 'Reabrir Recebível' : 'Confirmar Recebimento'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingReceivable(br);
                          setReceivableFormData({
                            description: br.description,
                            customerName: br.customerName,
                            orderNumber: br.orderNumber || '',
                            amount: br.amount,
                            dueDate: br.dueDate,
                            receivedDate: br.receivedDate,
                            status: br.status,
                            paymentMethod: br.paymentMethod,
                            notes: br.notes || '',
                          });
                          setIsReceivableModalOpen(true);
                        }}
                        className="p-1.5 text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Editar Conta"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeletingType('receivable');
                          setDeletingId(br.id);
                        }}
                        className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Excluir Conta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: COMPROVANTES E PAGAMENTOS RECEBIDOS (uses PaymentsView) */}
      {activeTab === 'comprovantes' && <PaymentsView />}

      {/* TAB 5: FORMAS DE PAGAMENTO E PIX (uses PixConfigView) */}
      {activeTab === 'formas_pix' && <PixConfigView />}

      {/* MODAL: CRIAR / EDITAR CONTA A PAGAR */}
      <Modal
        isOpen={isPayableModalOpen}
        onClose={() => setIsPayableModalOpen(false)}
        title={editingPayable ? 'Editar Conta a Pagar' : 'Cadastrar Conta a Pagar'}
        subtitle="Registro de faturas de importação, insumos de ateliê e custos operacionais"
        maxWidth="lg"
      >
        <form onSubmit={handleSavePayable} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Descrição da Despesa <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={payableFormData.description}
              onChange={(e) => setPayableFormData({ ...payableFormData, description: e.target.value })}
              placeholder="Ex: Lote de 1000 Frascos Murano 100ml"
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Nome do Fornecedor</label>
              <input
                type="text"
                value={payableFormData.supplierName}
                onChange={(e) => setPayableFormData({ ...payableFormData, supplierName: e.target.value })}
                placeholder="Ex: Luigi Vetro Cristallo"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Categoria de Custo</label>
              <select
                value={payableFormData.category}
                onChange={(e) => setPayableFormData({ ...payableFormData, category: e.target.value as any })}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              >
                <option value="Importação de Fragrâncias">Importação de Fragrâncias</option>
                <option value="Insumos de Grasse">Insumos de Grasse</option>
                <option value="Frascos & Vidraria">Frascos & Vidraria</option>
                <option value="Logística Internacional">Logística Internacional</option>
                <option value="Boutique & Operação">Boutique & Operação</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-amber-300 mb-1">
                Valor Total (R$) <span className="text-amber-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={payableFormData.amount}
                onChange={(e) => setPayableFormData({ ...payableFormData, amount: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-amber-500/40 rounded-lg text-xs text-amber-200 font-mono font-bold focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Data de Vencimento</label>
              <input
                type="date"
                required
                value={payableFormData.dueDate}
                onChange={(e) => setPayableFormData({ ...payableFormData, dueDate: e.target.value })}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Nº Documento / Fatura</label>
              <input
                type="text"
                value={payableFormData.documentNumber || ''}
                onChange={(e) => setPayableFormData({ ...payableFormData, documentNumber: e.target.value })}
                placeholder="INV-9921"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Status de Quitação</label>
              <select
                value={payableFormData.status}
                onChange={(e) => setPayableFormData({ ...payableFormData, status: e.target.value as any })}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              >
                <option value="Pendente">Pendente de Pagamento</option>
                <option value="Pago">Pago / Liquidado</option>
                <option value="Atrasado">Atrasado</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsPayableModalOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              {editingPayable ? 'Salvar Alterações' : 'Cadastrar Conta'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CRIAR / EDITAR CONTA A RECEBER */}
      <Modal
        isOpen={isReceivableModalOpen}
        onClose={() => setIsReceivableModalOpen(false)}
        title={editingReceivable ? 'Editar Conta a Receber' : 'Cadastrar Conta a Receber'}
        subtitle="Controle de vendas faturadas para clientes corporativos e pedidos a prazo"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveReceivable} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Descrição do Recebível <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={receivableFormData.description}
              onChange={(e) => setReceivableFormData({ ...receivableFormData, description: e.target.value })}
              placeholder="Ex: Faturamento 20 Perfumes Corporativo"
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Nome do Cliente VIP</label>
              <input
                type="text"
                value={receivableFormData.customerName}
                onChange={(e) => setReceivableFormData({ ...receivableFormData, customerName: e.target.value })}
                placeholder="Ex: Banco Safra Private"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Nº do Pedido Vinculado</label>
              <input
                type="text"
                value={receivableFormData.orderNumber || ''}
                onChange={(e) => setReceivableFormData({ ...receivableFormData, orderNumber: e.target.value })}
                placeholder="MR-9042"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-amber-300 mb-1">
                Valor Total (R$) <span className="text-amber-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={receivableFormData.amount}
                onChange={(e) => setReceivableFormData({ ...receivableFormData, amount: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-amber-500/40 rounded-lg text-xs text-amber-200 font-mono font-bold focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Data de Vencimento</label>
              <input
                type="date"
                required
                value={receivableFormData.dueDate}
                onChange={(e) => setReceivableFormData({ ...receivableFormData, dueDate: e.target.value })}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsReceivableModalOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              {editingReceivable ? 'Salvar Alterações' : 'Cadastrar Recebível'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => {
          setDeletingType(null);
          setDeletingId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja remover este registro financeiro? O fluxo de caixa será recalculado."
        confirmLabel="Sim, Excluir Registro"
      />
    </div>
  );
};
