import React from 'react';
import { X, Users, Check } from 'lucide-react';
import { TableItem } from '../types';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: TableItem[];
  selectedTable: string;
  onSelectTable: (tableName: string) => void;
}

export const TableModal: React.FC<TableModalProps> = ({
  isOpen,
  onClose,
  tables,
  selectedTable,
  onSelectTable,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div>
            <h3 className="font-bold text-base">Pilih Meja Restoran (Table Layout)</h3>
            <p className="text-xs text-slate-400">Atur meja untuk pesanan Dine In</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {tables.map((t) => {
              const isSelected = selectedTable === t.name;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelectTable(t.name);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20'
                      : t.status === 'occupied'
                      ? 'border-amber-200 bg-amber-50/70 text-amber-900 hover:border-amber-300'
                      : t.status === 'reserved'
                      ? 'border-purple-200 bg-purple-50/70 text-purple-900 hover:border-purple-300'
                      : 'border-slate-200 hover:border-emerald-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="font-extrabold text-sm">{t.name}</span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                    <Users className="w-3 h-3" />
                    <span>{t.capacity} Kursi</span>
                  </div>
                  <span
                    className={`mt-2 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      t.status === 'available'
                        ? 'bg-emerald-100 text-emerald-800'
                        : t.status === 'occupied'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {t.status === 'available' ? 'Kosong' : t.status === 'occupied' ? 'Terisi' : 'Reserved'}
                  </span>
                  {isSelected && (
                    <span className="mt-1 flex items-center gap-0.5 text-[10px] font-bold text-emerald-700">
                      <Check className="w-3 h-3" /> Terpilih
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
