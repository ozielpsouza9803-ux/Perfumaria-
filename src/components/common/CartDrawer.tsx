import React, { useState } from 'react';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  Tag,
  ShieldCheck,
  CreditCard,
  QrCode,
  FileText,
  Truck,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Database } from '../../services/database';
import { PaymentMethod, Order } from '../../types';
import { useToast } from './Toast';

interface CartDrawerProps {
  onOrderSuccess?: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOrderSuccess }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    discount,
    shipping,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { currentAdmin, isAuthenticated } = useAuth();
  const { success, error } = useToast();

  const [couponInput, setCouponInput] = useState('');
  const [step, setStep] = useState<'cart' | 'checkout' | 'confirmation'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pix');
  const [shippingAddress, setShippingAddress] = useState(
    'Av. da Liberdade, 1000 - Jardins, São Paulo - SP'
  );
  const [customerName, setCustomerName] = useState(currentAdmin?.name || 'Cliente Maison Royale');
  const [customerEmail, setCustomerEmail] = useState(currentAdmin?.email || 'cliente@maisonroyale.com.br');
  const [customerPhone, setCustomerPhone] = useState('(11) 99887-6655');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput) {
      await applyCoupon(couponInput);
      setCouponInput('');
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      error('Sua sacola está vazia.');
      return;
    }
    if (!customerName || !customerEmail || !shippingAddress) {
      error('Preencha os dados de entrega para prosseguir.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderNumber = `MR-${Date.now().toString().slice(-6)}`;
      const newOrder: Omit<Order, 'id' | 'createdAt'> = {
        orderNumber,
        customerId: currentAdmin?.id || 'guest-customer',
        customerName,
        customerEmail,
        customerPhone,
        items: cart.map((item) => ({
          productId: item.product.id,
          sku: item.product.sku,
          productName: item.product.name,
          volumeMl: item.product.volumeMl,
          quantity: item.quantity,
          unitPrice: item.product.salePrice,
          totalPrice: item.product.salePrice * item.quantity,
        })),
        subtotal,
        discount,
        couponCode: appliedCoupon || undefined,
        shipping,
        total,
        paymentMethod,
        paymentStatus: paymentMethod === 'Pix' ? 'Aprovado' : 'Pendente',
        fulfillmentStatus: 'Em Separação',
        shippingAddress,
        notes: 'Pedido gerado via Sacola de Luxo Pública',
      };

      const res = await Database.saveOrder(newOrder as Order);
      if (!res.success) {
        error(`Erro ao salvar pedido: ${res.message}`);
        setIsSubmitting(false);
        return;
      }

      // Decrement stock for each item via registerStockMovement
      for (const item of cart) {
        await Database.registerStockMovement({
          productId: item.product.id,
          productName: item.product.name,
          productSku: item.product.sku,
          type: 'SAIDA',
          quantity: item.quantity,
          previousStock: item.product.stockQuantity,
          newStock: Math.max(0, item.product.stockQuantity - item.quantity),
          unitCost: item.product.purchasePrice || item.product.salePrice,
          reason: `Venda Pedido ${orderNumber}`,
          adminName: currentAdmin?.name || customerName,
        });
      }

      const fullOrder = { ...newOrder, id: `ord_${Date.now()}`, createdAt: new Date().toISOString() } as Order;
      setCompletedOrder(fullOrder);
      clearCart();
      setStep('confirmation');
      success(`Pedido ${orderNumber} realizado com sucesso!`);
      if (onOrderSuccess) onOrderSuccess(fullOrder);
    } catch (err) {
      error('Falha ao processar o pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-950 border-l border-amber-500/30 text-zinc-100 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-base font-bold text-white tracking-wide">
                  Sacola de Luxo Haute
                </h2>
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest block">
                  {step === 'cart' && `${cart.length} itens selecionados`}
                  {step === 'checkout' && 'Finalizar Pagamento & Entrega'}
                  {step === 'confirmation' && 'Confirmação do Pedido'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {step === 'cart' && (
              <>
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16">
                    <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="font-serif text-base font-semibold text-zinc-300">
                      Sua Sacola está vazia
                    </h3>
                    <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                      Navegue pelo nosso acervo exclusivo de fragrâncias e adicione frascos raros para iniciar o pedido.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-3 group"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg bg-zinc-950 border border-zinc-800 shrink-0"
                          referrerPolicy="no-referrer"
                        />

                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-medium text-amber-400 uppercase tracking-wider block truncate">
                            {item.product.brandName}
                          </span>
                          <h4 className="font-serif text-xs font-semibold text-white truncate">
                            {item.product.name}
                          </h4>
                          <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                            {item.product.volumeMl}ml · R$ {item.product.salePrice.toFixed(2)}
                          </div>

                          {/* Quantity control */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="p-1 rounded bg-zinc-950 border border-zinc-800 hover:border-amber-500/40 text-zinc-300"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-mono font-bold w-6 text-center text-amber-300">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="p-1 rounded bg-zinc-950 border border-zinc-800 hover:border-amber-500/40 text-zinc-300"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono text-xs font-bold text-amber-300 block">
                            R$ {(item.product.salePrice * item.quantity).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id)}
                            className="mt-2 text-zinc-500 hover:text-rose-400 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Coupon Form */}
                    <div className="pt-2">
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            placeholder="Cupom (ex: ROYALE10)"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400 uppercase"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold"
                        >
                          Aplicar
                        </button>
                      </form>
                      {appliedCoupon && (
                        <div className="mt-2 flex items-center justify-between px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300 font-mono">
                          <span>Cupom {appliedCoupon} Ativo (-10%)</span>
                          <button
                            type="button"
                            onClick={removeCoupon}
                            className="text-zinc-400 hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {step === 'checkout' && (
              <div className="space-y-4 text-xs">
                {/* Shipping info */}
                <div className="p-4 bg-zinc-900/90 rounded-xl border border-zinc-800 space-y-3">
                  <h3 className="font-serif font-semibold text-white flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-400" />
                    Endereço de Entrega VIP
                  </h3>

                  <div>
                    <label className="block text-zinc-400 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-zinc-400 mb-1">E-mail</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">Telefone</label>
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Endereço de Entrega</label>
                    <textarea
                      rows={2}
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-amber-400 resize-none"
                    />
                  </div>
                </div>

                {/* Payment selection */}
                <div className="p-4 bg-zinc-900/90 rounded-xl border border-zinc-800 space-y-3">
                  <h3 className="font-serif font-semibold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    Forma de Pagamento
                  </h3>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Pix', label: 'Pix Instantâneo', icon: QrCode },
                      { id: 'Cartão de Crédito', label: 'Cartão 12x', icon: CreditCard },
                      { id: 'Boleto Bancário', label: 'Boleto', icon: FileText },
                    ].map((method) => {
                      const Icon = method.icon;
                      const isSelected = paymentMethod === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                          className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                            isSelected
                              ? 'border-amber-400 bg-amber-500/10 text-amber-300 font-bold'
                              : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-amber-400" />
                          <span className="text-[10px] text-center">{method.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 'confirmation' && completedOrder && (
              <div className="space-y-4 text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="font-serif text-lg font-bold text-white">
                    Pedido Confirmado!
                  </h3>
                  <span className="font-mono text-sm font-bold text-amber-400 block mt-1">
                    {completedOrder.orderNumber}
                  </span>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Sua ordem foi enviada ao ateliê de expedição da Maison Royale e já está em separação com protocolo de luxo.
                  </p>
                </div>

                <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Cliente:</span>
                    <span className="text-zinc-200 font-semibold">{completedOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Pagamento:</span>
                    <span className="text-amber-300 font-mono font-semibold">{completedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Valor Total:</span>
                    <span className="text-amber-400 font-mono font-bold">R$ {completedOrder.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Status:</span>
                    <span className="text-emerald-400 font-semibold">{completedOrder.fulfillmentStatus}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Totals & Action */}
          {cart.length > 0 && step !== 'confirmation' && (
            <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-900/90 space-y-3">
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal:</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Desconto ({appliedCoupon}):</span>
                    <span>- R$ {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-400">
                  <span>Frete VIP Expedido:</span>
                  <span>{shipping === 0 ? 'CORTESIA' : `R$ ${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                  <span>Valor Total:</span>
                  <span className="text-amber-300">R$ {total.toFixed(2)}</span>
                </div>
              </div>

              {step === 'cart' ? (
                <button
                  type="button"
                  onClick={() => setStep('checkout')}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>Avançar para Pagamento & Entrega</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('cart')}
                    className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs rounded-xl"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleCheckout}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Processando Pedido...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Concluir Adquisição Haute</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 'confirmation' && (
            <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-900/90">
              <button
                type="button"
                onClick={() => {
                  setStep('cart');
                  setIsCartOpen(false);
                }}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Voltar à Loja
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
