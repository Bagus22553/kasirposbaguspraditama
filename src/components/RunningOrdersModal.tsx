import React from 'react';
import { X, Clock, User, Utensils, ArrowUpRight, Trash2, FileText } from 'lucide-react';
import { Order } from '../types';

interface RunningOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  onViewReceipt: (order: Order) => void;
}

export const RunningOrdersModal: React.FC<RunningOrdersModalProps> = ({
  isOpen,
  onClose,
  orders,
  onSelectOrder,
  onDeleteOrder,
  onViewReceipt,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 bg-rose-600 text-white">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-base">Running Orders & Drafts</h3>
              <p className="text-xs text-rose-100">Daftar pesanan aktif dan antrean meja</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-rose-200 hover:text-white hover:bg-rose-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Clock className="w-12 h-12 mx-auto stroke-1 mb-2 text-slate-300" />
              <p className="font-medium text-sm">Tidak ada pesanan berjalan saat ini</p>
              <p className="text-xs mt-1">Buat pesanan baru dari layar kasir POS.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-rose-300 hover:shadow-md transition-all bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">{order.invoiceNumber}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        order.status === 'running'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}
                    >
                      {order.status === 'running' ? 'Berjalan' : 'Draft'}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                      {order.orderType} • {order.tableNumber}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {order.customer} (Waiter: {order.waiter})
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {order.createdAt}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1 pt-0.5">
                    {order.items.map((i) => `${i.name} (x${i.qty})`).join(', ')}
                  </p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Total</span>
                    <span className="text-base font-extrabold text-slate-900">${order.totalPayable.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onViewReceipt(order)}
                      title="Lihat Struk Sementara"
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                    >
                      <FileText className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        onSelectOrder(order);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                      <span>Buka Order</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Yakin batalkan pesanan ${order.invoiceNumber}?`)) {
                          onDeleteOrder(order.id);
                        }
                      }}
                      title="Batalkan / Hapus"
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
