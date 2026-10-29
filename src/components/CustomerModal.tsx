import React, { useState } from 'react';
import { X, UserPlus, Users, Search, Phone, Mail, Award, Check } from 'lucide-react';
import { Customer } from '../types';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  selectedCustomer: string;
  onSelectCustomer: (customerName: string) => void;
  onAddCustomer: (customer: Customer) => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  customers,
  selectedCustomer,
  onSelectCustomer,
  onAddCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  if (!isOpen) return null;

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim() || '-',
      email: newEmail.trim() || undefined,
      visits: 1,
    };
    onAddCustomer(newCust);
    onSelectCustomer(newCust.name);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setShowAddForm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 bg-pink-600 text-white">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <h3 className="font-bold text-base">Pilih / Kelola Pelanggan (Customer)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-pink-100 hover:text-white hover:bg-pink-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!showAddForm ? (
            <>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama atau nomor telepon..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-1 px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Tambah Baru</span>
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-1.5 divide-y divide-slate-100">
                {filtered.map((c) => {
                  const isSelected = selectedCustomer === c.name;
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        onSelectCustomer(c.name);
                        onClose();
                      }}
                      className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-pink-50 border border-pink-200'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-xs">{c.name}</span>
                          {c.visits > 5 && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] rounded-full font-bold">
                              <Award className="w-2.5 h-2.5" /> VIP
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" /> {c.phone}
                          </span>
                          {c.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" /> {c.email}
                            </span>
                          )}
                          <span>{c.visits} Kunjungan</span>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-pink-600 text-white">
                          <Check className="w-3.5 h-3.5 stroke-2" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <form onSubmit={handleCreate} className="space-y-3 p-1">
              <h4 className="font-bold text-sm text-slate-800">Tambah Pelanggan Baru</h4>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Prasetyo"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor WhatsApp / HP</label>
                <input
                  type="text"
                  placeholder="0812xxxxxxx"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email (Opsional)</label>
                <input
                  type="email"
                  placeholder="budi@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 text-xs border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Simpan & Pilih
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
