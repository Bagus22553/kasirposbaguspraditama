import React, { useState } from 'react';
import { CreditCard, QrCode, Banknote, CheckCircle, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { Order } from '../types';

interface PaymentModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onProcessPayment: (method: 'Cash' | 'QRIS' | 'Debit Card' | 'Credit Card', cashReceived: number, change: number) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  order,
  isOpen,
  onClose,
  onProcessPayment,
}) => {
  const [method, setMethod] = useState<'Cash' | 'QRIS' | 'Debit Card' | 'Credit Card'>('Cash');
  const [cashAmount, setCashAmount] = useState<string>(order.totalPayable.toFixed(2));

  if (!isOpen) return null;

  const total = order.totalPayable;
  const numCash = parseFloat(cashAmount) || 0;
  const change = Math.max(0, numCash - total);
  const isCashSufficient = method !== 'Cash' || numCash >= total;

  // Preset quick cash buttons
  const quickCashOptions = [
    Math.ceil(total),
    Math.ceil(total / 5) * 5,
    Math.ceil(total / 10) * 10,
    50,
    100,
  ].filter((v, idx, arr) => v >= total && arr.indexOf(v) === idx).slice(0, 4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCashSufficient) return;
    onProcessPayment(method, method === 'Cash' ? numCash : total, change);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div>
            <h3 className="font-bold text-lg">Pembayaran Kasir (Checkout)</h3>
            <p className="text-xs text-slate-400">Invoice: {order.invoiceNumber} • Meja: {order.tableNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Total Display */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tagihan</span>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                ${total.toFixed(2)}
              </div>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>{order.items.reduce((acc, i) => acc + i.qty, 0)} Items</p>
              <p>Pajak 10% & Servis Termasuk</p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Pilih Metode Pembayaran
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setMethod('Cash')}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 font-medium text-xs transition-all ${
                  method === 'Cash'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-800 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-600" />
                <span>Tunai / Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('QRIS')}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 font-medium text-xs transition-all ${
                  method === 'QRIS'
                    ? 'border-purple-600 bg-purple-50/70 text-purple-800 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <QrCode className="w-5 h-5 text-purple-600" />
                <span>QRIS Instant</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('Debit Card')}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 font-medium text-xs transition-all ${
                  method === 'Debit Card'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-800 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span>Kartu Debit</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('Credit Card')}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 font-medium text-xs transition-all ${
                  method === 'Credit Card'
                    ? 'border-amber-600 bg-amber-50/70 text-amber-800 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <CreditCard className="w-5 h-5 text-amber-600" />
                <span>Kartu Kredit</span>
              </button>
            </div>
          </div>

          {/* Method Details */}
          {method === 'Cash' && (
            <div className="space-y-3 p-4 bg-emerald-50/40 border border-emerald-100 rounded-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nominal Uang Diterima ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Quick Cash Presets */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCashAmount(total.toFixed(2))}
                  className="px-2.5 py-1 text-xs bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-md font-medium"
                >
                  Uang Pas (${total.toFixed(2)})
                </button>
                {quickCashOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setCashAmount(opt.toFixed(2))}
                    className="px-2.5 py-1 text-xs bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-md font-medium"
                  >
                    ${opt.toFixed(2)}
                  </button>
                ))}
              </div>

              {/* Change Info */}
              <div className="pt-2 border-t border-emerald-200 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-600">Uang Kembalian:</span>
                <span className={`text-xl font-extrabold ${change > 0 ? 'text-emerald-700' : 'text-slate-800'}`}>
                  ${change.toFixed(2)}
                </span>
              </div>
              {!isCashSufficient && (
                <p className="text-xs text-rose-600 font-medium">
                  Uang yang diterima kurang ${(total - numCash).toFixed(2)}!
                </p>
              )}
            </div>
          )}

          {method === 'QRIS' && (
            <div className="flex flex-col items-center justify-center p-4 bg-purple-50/50 border border-purple-100 rounded-xl text-center space-y-3">
              <div className="bg-white p-3 rounded-xl shadow-xs border border-purple-200">
                {/* Visual QR Code Representation */}
                <div className="w-36 h-36 bg-slate-900 rounded-lg p-2 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-8 h-8 border-4 border-white bg-slate-900 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white"></div>
                    </div>
                    <div className="w-8 h-8 border-4 border-white bg-slate-900 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white"></div>
                    </div>
                  </div>
                  <div className="flex justify-center items-center">
                    <div className="bg-purple-600 text-[8px] font-bold text-white px-1.5 py-0.5 rounded">
                      QRIS RESTO
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="w-8 h-8 border-4 border-white bg-slate-900 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-1 w-6 h-6">
                      <div className="bg-white"></div>
                      <div className="bg-white"></div>
                      <div className="bg-white"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-purple-900">Scan QRIS BCA / Mandiri / GoPay / OVO</p>
                <p className="text-[11px] text-purple-700 mt-0.5">Total Bayar: ${total.toFixed(2)}</p>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium mt-1">
                  <ShieldCheck className="w-3 h-3" /> Verifikasi Otomatis Siap
                </span>
              </div>
            </div>
          )}

          {(method === 'Debit Card' || method === 'Credit Card') && (
            <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-xl space-y-2 text-center">
              <CreditCard className="w-10 h-10 mx-auto text-blue-600" />
              <p className="text-xs font-semibold text-slate-800">Gesek atau Masukkan Kartu pada Mesin EDC</p>
              <p className="text-[11px] text-slate-500">
                Instruksikan pelanggan untuk memasukkan PIN pada mesin EDC.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold text-xs transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!isCashSufficient}
              className={`flex-2 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm text-white shadow-md transition-all ${
                isCashSufficient
                  ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-98'
                  : 'bg-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              <span>Bayar & Terbitkan Struk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
