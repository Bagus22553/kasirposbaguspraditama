import React, { useState } from 'react';
import { Package, Plus, Edit2, Trash2, Search, AlertTriangle, ArrowUpCircle, CheckCircle2 } from 'lucide-react';
import { RawMaterial } from '../types';

interface RawMaterialsManagementProps {
  rawMaterials: RawMaterial[];
  onAddRawMaterial: (material: RawMaterial) => void;
  onUpdateRawMaterial: (material: RawMaterial) => void;
  onDeleteRawMaterial: (id: string) => void;
}

export const RawMaterialsManagement: React.FC<RawMaterialsManagementProps> = ({
  rawMaterials,
  onAddRawMaterial,
  onUpdateRawMaterial,
  onDeleteRawMaterial,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RawMaterial | null>(null);

  // Quick Restock Modal
  const [restockItem, setRestockItem] = useState<RawMaterial | null>(null);
  const [restockAmount, setRestockAmount] = useState('');

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Daging & Seafood');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState<'kg' | 'gram' | 'liter' | 'ml' | 'pcs' | 'pack'>('kg');
  const [minStock, setMinStock] = useState('');
  const [unitCost, setUnitCost] = useState('');

  const categories = ['ALL', 'Daging & Seafood', 'Sayuran & Bumbu', 'Bahan Kering', 'Dairy', 'Minyak & Saus'];

  const filteredMaterials = rawMaterials.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || m.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const lowStockCount = rawMaterials.filter((m) => m.stock <= m.minStock).length;

  const handleOpenAdd = () => {
    setEditingItem(null);
    setCode(`RM-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setCategory('Daging & Seafood');
    setStock('10');
    setUnit('kg');
    setMinStock('5');
    setUnitCost('50000');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: RawMaterial) => {
    setEditingItem(item);
    setCode(item.code);
    setName(item.name);
    setCategory(item.category);
    setStock(item.stock.toString());
    setUnit(item.unit);
    setMinStock(item.minStock.toString());
    setUnitCost(item.unitCost.toString());
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data: RawMaterial = {
      id: editingItem ? editingItem.id : `raw-${Date.now()}`,
      code: code || `RM-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      category: category.trim(),
      stock: parseFloat(stock) || 0,
      unit,
      minStock: parseFloat(minStock) || 0,
      unitCost: parseFloat(unitCost) || 0,
      lastRestockDate: new Date().toISOString().split('T')[0],
    };

    if (editingItem) {
      onUpdateRawMaterial(data);
    } else {
      onAddRawMaterial(data);
    }
    setIsModalOpen(false);
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockItem || !restockAmount) return;
    const added = parseFloat(restockAmount) || 0;
    if (added <= 0) return;

    onUpdateRawMaterial({
      ...restockItem,
      stock: parseFloat((restockItem.stock + added).toFixed(2)),
      lastRestockDate: new Date().toISOString().split('T')[0],
    });
    setRestockItem(null);
    setRestockAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" />
            <span>Manajemen Bahan Baku & Stok Restoran (Baku)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kontrol stok bahan mentah, batas minimum restock, pengurangan otomatis tiap transaksi kasir, & CRUD bahan baku.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lowStockCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>{lowStockCount} Bahan Menipis</span>
            </div>
          )}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Bahan Baku</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama bahan baku, kode bahan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table List of Raw Materials */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Kode & Nama Bahan</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Stok Saat Ini</th>
                <th className="py-3.5 px-4">Batas Min.</th>
                <th className="py-3.5 px-4">Biaya Beli</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Terakhir Restock</th>
                <th className="py-3.5 px-4 text-right">Aksi (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredMaterials.map((m) => {
                const isCritical = m.stock <= 0;
                const isLow = m.stock <= m.minStock && m.stock > 0;
                return (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{m.name}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{m.code}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{m.category}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <span className="text-sm">{m.stock}</span>{' '}
                      <span className="text-[11px] font-normal text-slate-500">{m.unit}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {m.minStock} {m.unit}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      Rp {m.unitCost.toLocaleString('id-ID')} /{m.unit}
                    </td>
                    <td className="py-3.5 px-4">
                      {isCritical ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          <AlertTriangle className="w-3 h-3 text-rose-600" /> Stok Habis
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> Menipis
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Aman
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">{m.lastRestockDate}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setRestockItem(m);
                            setRestockAmount('5');
                          }}
                          title="Restock Tambah Stok"
                          className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                        >
                          <ArrowUpCircle className="w-3.5 h-3.5" />
                          <span>+ Restock</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(m)}
                          title="Edit / Rename Bahan"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus bahan baku "${m.name}"?`)) {
                              onDeleteRawMaterial(m.id);
                            }
                          }}
                          title="Hapus Bahan"
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Quick Modal */}
      {restockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3.5 bg-emerald-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">Restock Bahan Masuk</h3>
              <button onClick={() => setRestockItem(null)} className="text-white hover:opacity-80">
                ✕
              </button>
            </div>
            <form onSubmit={handleRestockSubmit} className="p-5 space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-700">{restockItem.name}</p>
                <p className="text-[11px] text-slate-500">
                  Stok sekarang: <span className="font-bold text-slate-800">{restockItem.stock} {restockItem.unit}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jumlah Tambahan ({restockItem.unit}) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  autoFocus
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRestockItem(null)}
                  className="flex-1 py-2 text-xs border border-slate-200 rounded-lg font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Tambah ke Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-bold text-base">
                {editingItem ? 'Edit / Rename Bahan Baku' : 'Tambah Bahan Baku Baru (Create)'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Bahan *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="RM-BEEF"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="Daging & Seafood">Daging & Seafood</option>
                    <option value="Sayuran & Bumbu">Sayuran & Bumbu</option>
                    <option value="Bahan Kering">Bahan Kering</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Minyak & Saus">Minyak & Saus</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Bahan Baku *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Daging Sapi Ribeye"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stok Awal *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Satuan *</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="gram">gram</option>
                    <option value="liter">liter</option>
                    <option value="ml">ml</option>
                    <option value="pcs">pcs (Satuan)</option>
                    <option value="pack">pack</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batas Min. Stok *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-amber-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Harga Beli per Satuan (Rp)</label>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                  placeholder="100000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Buat Bahan Baku'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
