import React, { useState, useEffect } from 'react';
import { Award, Plus, Search, Edit3, Trash2, Eye, Globe, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Database } from '../../services/database';
import { Brand, Product } from '../../types';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';

export const BrandsView: React.FC = () => {
  const { success, error } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'Ativa' | 'Inativa'>('TODOS');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [viewingBrand, setViewingBrand] = useState<Brand | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Brand, 'id'>>({
    name: '',
    country: '',
    description: '',
    foundedYear: 2000,
    status: 'Ativa',
    website: '',
  });

  const reloadData = async () => {
    setLoading(true);
    try {
      const bData = await Database.getBrands();
      const pData = await Database.getProducts();
      setBrands(bData);
      setProducts(pData);
    } catch (err) {
      error('Falha ao carregar dados das marcas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingBrand(null);
    setFormData({
      name: '',
      country: '',
      description: '',
      foundedYear: 2000,
      status: 'Ativa',
      website: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      country: brand.country,
      description: brand.description,
      foundedYear: brand.foundedYear,
      status: brand.status,
      website: brand.website || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.country.trim()) {
      error('Preencha os campos obrigatórios (Nome e País de Origem).');
      return;
    }

    const payload: Brand = {
      id: editingBrand ? editingBrand.id : '',
      name: formData.name.trim(),
      country: formData.country.trim(),
      description: formData.description.trim(),
      foundedYear: Number(formData.foundedYear) || 2026,
      status: formData.status,
      website: formData.website?.trim(),
    };

    const res = await Database.saveBrand(payload);
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
    const res = await Database.deleteBrand(deletingId);
    if (res.success) {
      success(res.message);
      reloadData();
    } else {
      error(res.message);
    }
    setDeletingId(null);
  };

  const filteredBrands = brands.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'TODOS' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white tracking-wide">
            Gestão de Marcas & Casas de Alta Perfumaria
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Cadastre ateliês mundiais de fragrâncias, casas olfativas históricas e marcas parceiras.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs rounded-lg shadow-md flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Marca</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome da marca ou país de origem..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 w-full sm:w-auto">
          {(['TODOS', 'Ativa', 'Inativa'] as const).map((st) => (
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

      {/* Brands Cards / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBrands.map((brand) => {
          const affiliatedProducts = products.filter((p) => p.brandId === brand.id);
          return (
            <div
              key={brand.id}
              className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-sm font-semibold text-white group-hover:text-amber-200 transition-colors">
                        {brand.name}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                        <span>{brand.country}</span>
                        <span>·</span>
                        <span className="font-mono">Fund. {brand.foundedYear}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 ${
                      brand.status === 'Ativa'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    {brand.status}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mt-3">
                  {brand.description || 'Sem descrição cadastrada.'}
                </p>

                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Fragrâncias Vinculadas:</span>
                  <span className="font-mono font-semibold text-amber-300">
                    {affiliatedProducts.length} perfume(s)
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-zinc-800/60">
                <button
                  type="button"
                  onClick={() => setViewingBrand(brand)}
                  className="p-2 text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Visualizar Detalhes"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(brand)}
                  className="p-2 text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Editar Marca"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingId(brand.id)}
                  className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Excluir Marca"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBrands.length === 0 && !loading && (
        <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800 rounded-xl text-zinc-500 text-xs">
          Nenhuma marca encontrada com os critérios pesquisados.
        </div>
      )}

      {loading && (
        <div className="p-12 text-center text-zinc-500 animate-pulse">Carregando casas olfativas...</div>
      )}

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBrand ? 'Editar Marca' : 'Cadastrar Casa Olfativa'}
        subtitle="Preencha os dados oficiais da marca parceira"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Nome da Marca / Ateliê <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Maison Francis Kurkdjian"
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                País de Origem <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="Ex: França (Grasse)"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Ano de Fundação
              </label>
              <input
                type="number"
                value={formData.foundedYear}
                onChange={(e) => setFormData({ ...formData, foundedYear: Number(e.target.value) })}
                placeholder="Ex: 1980"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Website Oficial</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://..."
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Status Operacional
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Ativa' | 'Inativa' })}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
            >
              <option value="Ativa">Ativa (Permite vincular novos perfumes)</option>
              <option value="Inativa">Inativa (Temporariamente suspensa)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Descrição & Tradição</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Histórico da marca, métodos de extração artesanal..."
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
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              {editingBrand ? 'Salvar Alterações' : 'Cadastrar Marca'}
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW DETAILS MODAL */}
      {viewingBrand && (
        <Modal
          isOpen={!!viewingBrand}
          onClose={() => setViewingBrand(null)}
          title={viewingBrand.name}
          subtitle={`Casa Olfativa de ${viewingBrand.country}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">País de Origem:</span>
                <span className="font-medium text-zinc-200">{viewingBrand.country}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Fundação:</span>
                <span className="font-mono text-zinc-200">{viewingBrand.foundedYear}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Situação:</span>
                <span
                  className={viewingBrand.status === 'Ativa' ? 'text-emerald-400' : 'text-zinc-400'}
                >
                  {viewingBrand.status}
                </span>
              </div>
              {viewingBrand.website && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Website:</span>
                  <a
                    href={viewingBrand.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>{viewingBrand.website}</span>
                  </a>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-300 uppercase mb-1">Sobre a Marca:</h4>
              <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
                {viewingBrand.description || 'Nenhuma descrição detalhada informada.'}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-300 uppercase mb-2">
                Perfumes Desta Casa no Catálogo:
              </h4>
              <div className="space-y-1.5">
                {products.filter((p) => p.brandId === viewingBrand.id).length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">Nenhum perfume associado no momento.</p>
                ) : (
                  products
                    .filter((p) => p.brandId === viewingBrand.id)
                    .map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2 rounded bg-zinc-950 border border-zinc-800/60 text-xs"
                      >
                        <span className="text-zinc-200">{p.name}</span>
                        <span className="font-mono text-amber-300">
                          R$ {p.salePrice.toFixed(2)} ({p.stockQuantity} un)
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingBrand(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg"
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
        title="Excluir Marca"
        message="Tem certeza que deseja remover esta marca? A exclusão só é permitida caso não haja nenhum perfume cadastrado sob esta casa."
        confirmLabel="Sim, Excluir Marca"
      />
    </div>
  );
};
