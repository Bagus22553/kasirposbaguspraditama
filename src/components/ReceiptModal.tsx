import React, { useState } from 'react';
import { Printer, Download, CheckCircle2, X } from 'lucide-react';
import { Order } from '../types';
import { generateReceiptPdf } from '../utils/pdfGenerator';

interface ReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, isOpen, onClose }) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    generateReceiptPdf(order);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="font-semibold text-base">Struk Transaksi Kasir</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons Top */}
        <div className="flex gap-2 p-3 bg-slate-100 border-b border-slate-200">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-98 text-white rounded-lg font-medium text-xs transition-all shadow-xs"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Cetak Struk (Print)</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-lg font-medium text-xs transition-all shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>

        {downloadSuccess && (
          <div className="mx-4 mt-3 py-2 px-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Struk PDF berhasil di-download! Cek folder download Anda.</span>
          </div>
        )}

        {/* Receipt Container Preview */}
        <div className="p-4 bg-slate-200/70 max-h-[62vh] overflow-y-auto flex justify-center">
          <div
            id="thermal-receipt-print-target"
            className="w-full max-w-[310px] bg-white p-5 shadow-md border border-slate-200 font-mono text-[11px] leading-relaxed text-slate-800 rounded-sm"
          >
            {/* Header info */}
            <div className="text-center border-b border-dashed border-slate-300 pb-3 mb-3">
              <h2 className="font-bold text-sm text-slate-900 tracking-wider">RESTO POS DELUXE</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Jl. Senopati Culinary No. 88, Jakarta</p>
              <p className="text-[10px] text-slate-500">Telp: (021) 789-2233</p>
            </div>

            {/* Meta info */}
            <div className="border-b border-dashed border-slate-300 pb-2 mb-2 text-[10px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Inv:</span>
                <span className="font-bold">{order.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu:</span>
                <span>{order.createdAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kasir/Waiter:</span>
                <span className="font-medium">{order.waiter}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tipe / Meja:</span>
                <span className="font-medium text-slate-900">{order.orderType} {order.tableNumber !== '-' ? `(${order.tableNumber})` : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pelanggan:</span>
                <span>{order.customer}</span>
              </div>
            </div>

            {/* Items table */}
            <div className="border-b border-dashed border-slate-300 pb-2 mb-2">
              <div className="text-[10px] font-bold text-slate-700 flex justify-between border-b border-slate-200 pb-1 mb-1">
                <span>ITEM</span>
                <span>TOTAL</span>
              </div>
              <div className="space-y-1.5 mt-1.5">
                {order.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-800">{item.name}</span>
                      <span>${item.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex justify-between pl-2">
                      <span>{item.qty} x ${item.price.toFixed(2)}</span>
                      {item.discount > 0 && <span className="text-rose-600">-disc ${item.discount.toFixed(2)}</span>}
                    </div>
                    {item.comboDescription && (
                      <p className="text-[9px] text-slate-400 italic pl-2 leading-tight">
                        {item.comboDescription}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations */}
            <div className="border-b border-dashed border-slate-300 pb-2 mb-2 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal:</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Diskon:</span>
                  <span>-${order.discountTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Pajak (Tax 10%):</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              {order.service > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Service (5%):</span>
                  <span>${order.service.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-200 text-slate-900">
                <span>TOTAL PAYABLE:</span>
                <span className="text-emerald-700">${order.totalPayable.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Details */}
            {order.paymentMethod && (
              <div className="border-b border-dashed border-slate-300 pb-2 mb-3 text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Metode Bayar:</span>
                  <span className="font-bold text-slate-800">{order.paymentMethod}</span>
                </div>
                {order.cashReceived && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tunai Diterima:</span>
                    <span>${order.cashReceived.toFixed(2)}</span>
                  </div>
                )}
                {order.change !== undefined && (
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">Kembalian:</span>
                    <span>${order.change.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Barcode & Footer */}
            <div className="text-center pt-1">
              <div className="inline-block py-1 px-3 bg-slate-100 rounded text-slate-800 font-mono tracking-widest text-[9px] mb-2 border border-slate-300">
                ||||| | |||| || ||||| |||||
              </div>
              <p className="text-[10px] font-semibold text-slate-700">TERIMA KASIH ATAS KUNJUNGAN ANDA</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Layanan Bebas WiFi RestoFree</p>
              <p className="text-[8px] text-slate-400 mt-1">Dicetak: {new Date().toLocaleDateString('id-ID')}</p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-3 bg-white border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            Selesai / Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
