import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Filter,
  AlertCircle,
  Sparkles,
  Droplets,
  DollarSign,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { Database, LUXURY_PRESET_IMAGES } from '../../services/database';
import { Product, Brand, OlfactoryFamily, FragranceConcentration } from '../../types';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ImageUpload } from '../common/ImageUpload';
import { useToast } from '../common/Toast';

const OLFACTORY_FAMILIES: OlfactoryFamily[] = [
  'Amadeirado',
  'Oriental & Âmbar',
  'Floral Nobre',
  'Cítrico & Fresco',
  'Chipre Frutado',
  'Gourmand',
  'Couro & Tabaco',
];

const CONCENTRATIONS: FragranceConcentration[] = [
  'Extrait de Parfum',
  'Eau de Parfum',
  'Eau de Toilette',
  'Eau de Cologne',
  'Attar Puro',
];

export const ProductsView: React.FC = () => {
  const { success, error } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const reloadData = async () => {
    const pData = await Database.getProducts();
    const bData = await Database.getBrands();
    setProducts(pData);
    setBrands(bData);
  };

  useEffect(() => {
    reloadData();
    window.addEventListener('mr_database_change', reloadData);
    window.addEventListener('open_create_product', handleOpenCreate);
    return () => {
      window.removeEventListener('mr_database_change', reloadData);
      window.removeEventListener('open_create_product', handleOpenCreate);
    };
  }, [brands]); // Depend on brands to ensure the select has data

  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [familyFilter, setFamilyFilter] = useState<string>('TODAS');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>({
    sku: '',
    name: '',
    brandId: '',
    olfactoryFamily: 'Amadeirado',
    concentration: 'Eau de Parfum',
    volumeMl: 100,
    purchasePrice: 0,
    salePrice: 0,
    stockQuantity: 10,
    minStockAlert: 5,
    image: LUXURY_PRESET_IMAGES[0].url,
    status: 'Ativo',
    description: '',
    topNotes: '',
    heartNotes: '',
    baseNotes: '',
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      sku: 'MR-' + Math.floor(100 + Math.random() * 900),
      name: '',
      brandId: brands[0]?.id || '',
      olfactoryFamily: 'Amadeirado',
      concentration: 'Eau de Parfum',
      volumeMl: 100,
      purchasePrice: 350,
      salePrice: 950,
      stockQuantity: 10,
      minStockAlert: 5,
      image: LUXURY_PRESET_IMAGES[0].url,
      status: 'Ativo',
      description: '',
      topNotes: '',
      heartNotes: '',
      baseNotes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      sku: p.sku,
      name: p.name,
      brandId: p.brandId,
      olfactoryFamily: p.olfactoryFamily,
      concentration: p.concentration,
      volumeMl: p.volumeMl,
      purchasePrice: p.purchasePrice,
      salePrice: p.salePrice,
      stockQuantity: p.stockQuantity,
      minStockAlert: p.minStockAlert,
      image: p.image,
      status: p.status,
      description: p.description,
      topNotes: p.topNotes,
      heartNotes: p.heartNotes,
      baseNotes: p.baseNotes,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim() || !formData.brandId) {
      error('Preencha os campos obrigatórios (Nome, SKU e Marca).');
      return;
    }
    if (formData.salePrice <= 0) {
      error('O preço de venda deve ser maior que zero.');
      return;
    }

    const payload: Product = {
      id: editingProduct ? editingProduct.id : '',
      sku: formData.sku.trim().toUpperCase(),
      name: formData.name.trim(),
      brandId: formData.brandId,
      olfactoryFamily: formData.olfactoryFamily,
      concentration: formData.concentration,
      volumeMl: Number(formData.volumeMl),
      purchasePrice: Number(formData.purchasePrice),
      salePrice: Number(formData.salePrice),
      stockQuantity: Number(formData.stockQuantity),
      minStockAlert: Number(formData.minStockAlert),
      image: formData.image || LUXURY_PRESET_IMAGES[0].url,
      status: formData.status,
      description: formData.description.trim(),
      topNotes: formData.topNotes.trim(),
      heartNotes: formData.heartNotes.trim(),
      baseNotes: formData.baseNotes.trim(),
      createdAt: editingProduct ? editingProduct.createdAt : '',
      updatedAt: new Date().toISOString(),
    };

    const res = await Database.saveProduct(payload);
    if (res.success) {
      success(res.message);
      setIsModalOpen(false);
      reloadData();
    } else {
      error(res.message);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    const res = await Database.deleteProduct(deletingId);
    if (res.success) {
      success(res.message);
      reloadData();
    } else {
      error(res.message);
    }
    setDeletingId(null);
  };

  // Profit calculation live
  const calculatedMargin =
    formData.salePrice > 0
      ? (((formData.salePrice - formData.purchasePrice) / formData.salePrice) * 100).toFixed(1)
      : '0.0';

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.olfactoryFamily.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brandName && p.brandName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFamily = familyFilter === 'TODAS' || p.olfactoryFamily === familyFilter;
    const matchesStatus = statusFilter === 'TODOS' || p.status === statusFilter;
    const matchesLowStock = !onlyLowStock || p.stockQuantity <= p.minStockAlert;

    return matchesSearch && matchesFamily && matchesStatus && matchesLowStock;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white tracking-wide">
            Catálogo & Acervo de Fragrâncias
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Gestão minuciosa de perfumes, pirâmides olfativas, volumes, custos e imagens da galeria.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs rounded-lg shadow-md flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Perfume</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por nome do perfume, SKU, notas ou marca..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Family select */}
            <select
              value={familyFilter}
              onChange={(e) => setFamilyFilter(e.target.value)}
              className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-amber-400"
            >
              <option value="TODAS">Família Olfativa: Todas</option>
              {OLFACTORY_FAMILIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>

            {/* Status select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-amber-400"
            >
              <option value="TODOS">Status: Todos</option>
              <option value="Ativo">Ativo</option>
              <option value="Rascunho">Rascunho</option>
              <option value="Esgotado">Esgotado</option>
            </select>

            <button
              type="button"
              onClick={() => setOnlyLowStock(!onlyLowStock)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                onlyLowStock
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Estoque Baixo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredProducts.map((p) => {
          const isCritical = p.stockQuantity <= p.minStockAlert;
          return (
            <div
              key={p.id}
              className="rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 transition-all overflow-hidden flex flex-col justify-between group"
            >
              {/* Product Image Lead (65-75% height priority per guidelines) */}
              <div className="relative aspect-4/3 bg-zinc-950 overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-zinc-300 border border-white/10">
                  {p.sku}
                </div>
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium backdrop-blur-md ${
                      p.status === 'Ativo'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                        : p.status === 'Esgotado'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                        : 'bg-zinc-800/80 text-zinc-300 border border-zinc-600'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                {isCritical && (
                  <div className="absolute bottom-2 left-2 right-2 bg-rose-900/90 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded flex items-center justify-between">
                    <span>Estoque Crítico</span>
                    <span className="font-mono font-bold">{p.stockQuantity} frasco(s)</span>
                  </div>
                )}
              </div>

              {/* Product Content */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-[11px] font-medium text-amber-400 uppercase tracking-wider truncate">
                    {p.brandName}
                  </div>
                  <h3 className="font-serif text-sm font-semibold text-white group-hover:text-amber-200 transition-colors line-clamp-1 mt-0.5">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-1">
                    <span>{p.concentration}</span>
                    <span>·</span>
                    <span className="font-mono">{p.volumeMl}ml</span>
                    <span>·</span>
                    <span>{p.olfactoryFamily}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Preço de Venda</span>
                    <span className="font-mono text-sm font-bold text-amber-300 tabular-nums">
                      R$ {p.salePrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 block">Estoque</span>
                    <span
                      className={`font-mono text-xs font-semibold tabular-nums ${
                        isCritical ? 'text-rose-400' : 'text-zinc-300'
                      }`}
                    >
                      {p.stockQuantity} un
                    </span>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-zinc-800/60">
                  <button
                    type="button"
                    onClick={() => setViewingProduct(p)}
                    className="p-1.5 text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 rounded transition-colors"
                    title="Ficha Olfativa Completa"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 rounded transition-colors"
                    title="Editar Perfume"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(p.id)}
                    className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                    title="Excluir Perfume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="p-10 text-center bg-zinc-900/40 border border-zinc-800 rounded-xl text-zinc-500 text-xs">
          Nenhum perfume encontrado com os filtros selecionados.
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Editar Fragrância' : 'Cadastrar Nova Fragrância'}
        subtitle="Upload de imagem da galeria, pirâmide olfativa e controle de preços"
        maxWidth="3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload Component (Device gallery or studio shots) */}
          <ImageUpload
            value={formData.image}
            onChange={(url) => setFormData({ ...formData, image: url })}
            label="Fotografia do Frasco / Caixa"
            hint="Toque para enviar direto da galeria do seu celular/computador ou use fotos de estúdio"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Nome do Perfume <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Noir Oracle Extrait de Parfum"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Código SKU <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                placeholder="MR-NOIR-100"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Casa Olfativa / Marca <span className="text-amber-400">*</span>
              </label>
              <select
                value={formData.brandId}
                onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Família Olfativa
              </label>
              <select
                value={formData.olfactoryFamily}
                onChange={(e) =>
                  setFormData({ ...formData, olfactoryFamily: e.target.value as OlfactoryFamily })
                }
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              >
                {OLFACTORY_FAMILIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Concentração</label>
              <select
                value={formData.concentration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    concentration: e.target.value as FragranceConcentration,
                  })
                }
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              >
                {CONCENTRATIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Volume and Pricing Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-zinc-950 rounded-lg border border-zinc-800">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Volume (ml)</label>
              <input
                type="number"
                value={formData.volumeMl}
                onChange={(e) => setFormData({ ...formData, volumeMl: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Preço de Custo (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-amber-300 mb-1">Preço de Venda (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-zinc-900 border border-amber-500/50 rounded text-xs text-amber-200 font-mono font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Margem Bruta</label>
              <div className="px-3 py-1.5 bg-zinc-900 rounded text-xs font-mono font-bold text-emerald-400">
                {calculatedMargin}%
              </div>
            </div>
          </div>

          {/* Stock Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Estoque Atual (Frascos)
              </label>
              <input
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Alerta de Estoque Mínimo
              </label>
              <input
                type="number"
                value={formData.minStockAlert}
                onChange={(e) => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Status no Catálogo</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as 'Ativo' | 'Rascunho' | 'Esgotado' })
                }
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              >
                <option value="Ativo">Ativo (Disponível na vitrine)</option>
                <option value="Rascunho">Rascunho (Em formulação)</option>
                <option value="Esgotado">Esgotado (Sem unidades)</option>
              </select>
            </div>
          </div>

          {/* Olfactory Pyramid (Pirâmide Olfativa) */}
          <div className="p-3 bg-zinc-950 rounded-lg border border-amber-500/20 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 uppercase tracking-wide">
              <Droplets className="w-4 h-4" />
              <span>Pirâmide Olfativa & Acordes Nobres</span>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Notas de Saída / Topo</label>
              <input
                type="text"
                value={formData.topNotes}
                onChange={(e) => setFormData({ ...formData, topNotes: e.target.value })}
                placeholder="Ex: Bergamota da Calábria, Pimenta Rosa, Cardamomo"
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Notas de Coração / Corpo</label>
              <input
                type="text"
                value={formData.heartNotes}
                onChange={(e) => setFormData({ ...formData, heartNotes: e.target.value })}
                placeholder="Ex: Rosa de Maio de Grasse, Incenso de Olíbano, Íris Nobre"
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Notas de Fundo / Base</label>
              <input
                type="text"
                value={formData.baseNotes}
                onChange={(e) => setFormData({ ...formData, baseNotes: e.target.value })}
                placeholder="Ex: Âmbar Resinoso, Cedro do Atlas, Fava Tonka Negra"
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Descrição Sensorial & Conceito
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Poética olfativa da fragrância, notas de inspiração e atmosfera..."
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs rounded-lg transition-all cursor-pointer"
            >
              {editingProduct ? 'Salvar Alterações' : 'Cadastrar Frasco'}
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW FICHA OLFATIVA MODAL */}
      {viewingProduct && (
        <Modal
          isOpen={!!viewingProduct}
          onClose={() => setViewingProduct(null)}
          title={viewingProduct.name}
          subtitle={`Ficha Técnica Oficial · SKU ${viewingProduct.sku}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="aspect-4/3 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
                <img
                  src={viewingProduct.image}
                  alt={viewingProduct.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Marca:</span>
                    <span className="text-zinc-200 font-medium">{viewingProduct.brandName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Concentração:</span>
                    <span className="text-zinc-200 font-medium">{viewingProduct.concentration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Família Olfativa:</span>
                    <span className="text-amber-300 font-medium">{viewingProduct.olfactoryFamily}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Volume:</span>
                    <span className="font-mono text-zinc-200">{viewingProduct.volumeMl}ml</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Preço de Venda:</span>
                    <span className="font-mono text-amber-300 font-bold">
                      R$ {viewingProduct.salePrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Saldo em Estoque:</span>
                    <span className="font-mono text-zinc-100 font-bold">
                      {viewingProduct.stockQuantity} frasco(s)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Olfactory Pyramid */}
            <div className="p-4 bg-zinc-950 rounded-xl border border-amber-500/30 space-y-3">
              <div className="text-xs font-serif font-semibold text-amber-300 uppercase tracking-wider text-center">
                Pirâmide Olfativa
              </div>

              <div className="space-y-2 text-xs">
                {/* Top notes */}
                <div className="p-2.5 bg-zinc-900/90 rounded-lg border border-amber-500/20 text-center">
                  <span className="block text-[10px] uppercase tracking-wider text-amber-400 font-semibold mb-0.5">
                    Topo / Saída (Primeiros 15 minutos)
                  </span>
                  <span className="text-zinc-200">{viewingProduct.topNotes || 'Não informado'}</span>
                </div>

                {/* Heart notes */}
                <div className="p-2.5 bg-zinc-900/90 rounded-lg border border-amber-500/20 text-center">
                  <span className="block text-[10px] uppercase tracking-wider text-amber-400 font-semibold mb-0.5">
                    Coração / Corpo (2 a 6 horas)
                  </span>
                  <span className="text-zinc-200">{viewingProduct.heartNotes || 'Não informado'}</span>
                </div>

                {/* Base notes */}
                <div className="p-2.5 bg-zinc-900/90 rounded-lg border border-amber-500/20 text-center">
                  <span className="block text-[10px] uppercase tracking-wider text-amber-400 font-semibold mb-0.5">
                    Fundo / Base (Fixação prolongada até 24h)
                  </span>
                  <span className="text-zinc-200">{viewingProduct.baseNotes || 'Não informado'}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-300 uppercase mb-1">Poética Sensorial:</h4>
              <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                {viewingProduct.description || 'Nenhuma descrição conceitual informada.'}
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingProduct(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg"
              >
                Fechar Ficha
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
        title="Remover Perfume do Catálogo"
        message="Tem certeza que deseja excluir esta fragrância? O produto será descontinuado e o saldo de estoque deixará de ser contabilizado."
        confirmLabel="Sim, Excluir Fragrância"
      />
    </div>
  );
};
