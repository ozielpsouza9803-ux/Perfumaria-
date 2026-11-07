import React, { useState, useEffect, useRef } from 'react';
import { Search, Package, ShoppingBag, Users, Award, ArrowRight, X } from 'lucide-react';
import { Database } from '../../services/database';
import { NavTab } from './Sidebar';
import { Product, Order, Customer, Brand } from '../../types';

interface QuickSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab) => void;
}

export const QuickSearch: React.FC<QuickSearchProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<{
    products: Product[];
    orders: Order[];
    customers: Customer[];
    brands: Brand[];
  }>({ products: [], orders: [], customers: [], brands: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      loadAllData();
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [products, orders, customers, brands] = await Promise.all([
        Database.getProducts(),
        Database.getOrders(),
        Database.getCustomers(),
        Database.getBrands(),
      ]);
      setData({ products, orders, customers, brands });
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open
          const event = new CustomEvent('open_quick_search');
          window.dispatchEvent(event);
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredProducts = data.products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase()) ||
      p.olfactoryFamily.toLowerCase().includes(query.toLowerCase())
  );

  const filteredOrders = data.orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
      o.customerName.toLowerCase().includes(query.toLowerCase())
  );

  const filteredCustomers = data.customers.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase())
  );

  const filteredBrands = data.brands.filter((b) =>
    b.name.toLowerCase().includes(query.toLowerCase())
  );

  const totalResults = filteredProducts.length + filteredOrders.length + filteredCustomers.length + filteredBrands.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-zinc-900 border border-amber-500/40 rounded-xl shadow-2xl shadow-black overflow-hidden flex flex-col"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-zinc-800 bg-zinc-950/70 gap-3">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite para pesquisar fragrância, cliente, pedido ou marca..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-zinc-500 hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 text-[10px] bg-zinc-800 text-zinc-400 rounded border border-zinc-700 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-xs">
          {loading ? (
            <div className="p-8 text-center text-zinc-500 animate-pulse">Indexando banco de dados...</div>
          ) : query.trim() === '' ? (
            <div className="p-4 text-center text-zinc-500">
              Digite o nome de uma fragrância, número de pedido (ex: MR-2041) ou cliente.
            </div>
          ) : totalResults === 0 ? (
            <div className="p-6 text-center text-zinc-400">
              Nenhum registro encontrado para "{query}".
            </div>
          ) : (
            <>
              {/* Products */}
              {filteredProducts.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-amber-400/80 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    Perfumes Encontrados ({filteredProducts.length})
                  </div>
                  <div className="space-y-1">
                    {filteredProducts.slice(0, 4).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          onNavigate('products');
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/60 text-left transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-7 h-7 object-cover rounded bg-zinc-950 border border-zinc-800"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="text-zinc-200 font-medium group-hover:text-amber-300">
                              {p.name}
                            </div>
                            <div className="text-[11px] text-zinc-500">
                              {p.sku} · {p.olfactoryFamily} · Estoque: {p.stockQuantity} un
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders */}
              {filteredOrders.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-amber-400/80 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Pedidos ({filteredOrders.length})
                  </div>
                  <div className="space-y-1">
                    {filteredOrders.slice(0, 3).map((o) => (
                      <button
                        key={o.id}
                        onClick={() => {
                          onNavigate('orders');
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/60 text-left transition-colors group"
                      >
                        <div>
                          <div className="text-zinc-200 font-medium group-hover:text-amber-300">
                            Pedido #{o.orderNumber} — R$ {o.total.toFixed(2)}
                          </div>
                          <div className="text-[11px] text-zinc-500">
                            Cliente: {o.customerName} · Status: {o.paymentStatus}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers */}
              {filteredCustomers.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-amber-400/80 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Clientes VIP ({filteredCustomers.length})
                  </div>
                  <div className="space-y-1">
                    {filteredCustomers.slice(0, 3).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          onNavigate('customers');
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/60 text-left transition-colors group"
                      >
                        <div>
                          <div className="text-zinc-200 font-medium group-hover:text-amber-300">
                            {c.name}
                          </div>
                          <div className="text-[11px] text-zinc-500">
                            {c.email} · {c.vipTier} · {c.city}/{c.state}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Brands */}
              {filteredBrands.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-amber-400/80 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    Marcas ({filteredBrands.length})
                  </div>
                  <div className="space-y-1">
                    {filteredBrands.slice(0, 3).map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          onNavigate('brands');
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/60 text-left transition-colors group"
                      >
                        <div>
                          <div className="text-zinc-200 font-medium group-hover:text-amber-300">
                            {b.name}
                          </div>
                          <div className="text-[11px] text-zinc-500">
                            Origem: {b.country} · Fundada em {b.foundedYear}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
