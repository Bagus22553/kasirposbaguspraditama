import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon, Check, UtensilsCrossed, AlertCircle } from 'lucide-react';
import { MenuItem, RawMaterial } from '../types';

interface MenuManagementProps {
  menuItems: MenuItem[];
  rawMaterials: RawMaterial[];
  onAddMenuItem: (item: MenuItem) => void;
  onUpdateMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (id: string) => void;
}

export const MenuManagement: React.FC<MenuManagementProps> = ({
  menuItems,
  rawMaterials,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Food');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState<'available' | 'sold_out'>('available');
  const [description, setDescription] = useState('');
  const [comboDescription, setComboDescription] = useState('');

  const categories = ['ALL', 'Food', 'Pasta', 'Curry', 'Combo', 'Appetizer', 'Soup', 'Dessert', 'Beverage'];

  const filteredItems = menuItems.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || item.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchSearch && matchCat;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setCode(`M-0${menuItems.length + 1}`);
    setName('');
    setCategory('Food');
    setPrice('');
    setImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80');
    setStatus('available');
    setDescription('');
    setComboDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setCode(item.code);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price.toString());
    setImage(item.image);
    setStatus(item.status);
    setDescription(item.description || '');
    setComboDescription(item.comboDescription || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    const itemData: MenuItem = {
      id: editingItem ? editingItem.id : `menu-${Date.now()}`,
      code: code || `M-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      category: category.trim(),
      price: parseFloat(price) || 0,
      image: image.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      status,
      description: description.trim(),
      comboDescription: comboDescription.trim() || undefined,
      recipe: editingItem?.recipe || [],
    };

    if (editingItem) {
      onUpdateMenuItem(itemData);
    } else {
      onAddMenuItem(itemData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-rose-500" />
            <span>Manajemen Menu Restoran (CRUD)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola daftar menu makanan, minuman, paket kombo, harga, rename dan stok ketersediaan.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Menu Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama menu, kode, kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
          >
            <div className="relative h-40 bg-slate-100 overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                }}
              />
              <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                {item.code}
              </span>
              <span
                className={`absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  item.status === 'available'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {item.status === 'available' ? 'Tersedia' : 'Habis'}
              </span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-purple-700 font-bold mb-1">
                  <span>{item.category}</span>
                  <span className="text-slate-900 font-extrabold text-sm">${item.price.toFixed(2)}</span>
                </div>
                <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{item.name}</h3>
                {item.comboDescription ? (
                  <p className="text-[11px] text-amber-600 font-medium line-clamp-2 mt-1 italic">
                    {item.comboDescription}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {item.description || 'Hidangan istimewa pilihan chef.'}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 gap-2">
                <button
                  onClick={() =>
                    onUpdateMenuItem({
                      ...item,
                      status: item.status === 'available' ? 'sold_out' : 'available',
                    })
                  }
                  className={`px-2 py-1 text-[11px] font-semibold rounded-lg border transition-colors ${
                    item.status === 'available'
                      ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                      : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  Set {item.status === 'available' ? 'Habis' : 'Tersedia'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    title="Edit / Rename Menu"
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus menu "${item.name}" secara permanen?`)) {
                        onDeleteMenuItem(item.id);
                      }
                    }}
                    title="Hapus Menu"
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <AlertCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-600">Tidak ada menu yang sesuai kriteria</p>
          <p className="text-xs text-slate-400 mt-1">Coba kata kunci lain atau tambahkan menu baru.</p>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-bold text-base">
                {editingItem ? 'Edit / Rename Menu' : 'Tambah Menu Baru (Create)'}
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Menu *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="M-015"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                  >
                    <option value="Food">Food</option>
                    <option value="Pasta">Pasta</option>
                    <option value="Curry">Curry</option>
                    <option value="Combo">Combo</option>
                    <option value="Appetizer">Appetizer</option>
                    <option value="Soup">Soup</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Beverage">Beverage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Menu *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Massaman Beef Curry"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Harga Jual ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="3.00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Ketersediaan</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'available' | 'sold_out')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                  >
                    <option value="available">Tersedia (Ready)</option>
                    <option value="sold_out">Habis (Sold Out)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">URL Foto Menu</label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi / Rincian Paket Kombo (Opsional)
                </label>
                <input
                  type="text"
                  value={comboDescription}
                  onChange={(e) => setComboDescription(e.target.value)}
                  placeholder="Items: Hot And Sour Soup(Qty:1), Massaman Beef Curry(Qty:1)..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
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
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Buat Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
