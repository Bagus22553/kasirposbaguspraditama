import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  FileText,
  Printer,
  Download,
  Utensils,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Order, MenuItem, RawMaterial } from '../types';
import { generateReceiptPdf } from '../utils/pdfGenerator';

interface AdminDashboardProps {
  orders: Order[];
  menuItems: MenuItem[];
  rawMaterials: RawMaterial[];
  onViewReceipt: (order: Order) => void;
  onResetData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  menuItems,
  rawMaterials,
  onViewReceipt,
  onResetData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate metrics
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalPayable, 0);
  const totalTransactions = completedOrders.length;
  const avgTicket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  const lowStockCount = rawMaterials.filter((m) => m.stock <= m.minStock).length;

  // Filtered orders for table
  const filteredOrders = orders.filter(
    (o) =>
      o.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.waiter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.tableNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Top selling menu item calc
  const salesMap: Record<string, { name: string; count: number; revenue: number; image: string }> = {};
  completedOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (!salesMap[item.name]) {
        const menuItem = menuItems.find((m) => m.name === item.name);
        salesMap[item.name] = {
          name: item.name,
          count: 0,
          revenue: 0,
          image: menuItem?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        };
      }
      salesMap[item.name].count += item.qty;
      salesMap[item.name].revenue += item.subtotal;
    });
  });

  const topSelling = Object.values(salesMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <span>Dashboard Admin & Laporan Penjualan POS</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analitik pendapatan, riwayat transaksi kasir, cetak ulang struk, dan unduh PDF arsip.
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('Muat ulang data demo awal (Menu, Bahan Baku, dan Transaksi)?')) {
              onResetData();
            }
          }}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Penjualan</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">${totalRevenue.toFixed(2)}</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-0.5">
              <span>+18.4%</span> dari hari kemarin
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Transactions Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Transaksi Selesai</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalTransactions} Transaksi</h3>
            <p className="text-[11px] text-slate-400 mt-1">Status Lunas & Terverifikasi</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Average Order Ticket */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rata-rata Order</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">${avgTicket.toFixed(2)}</h3>
            <p className="text-[11px] text-slate-400 mt-1">Per tiket transaksi</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Utensils className="w-6 h-6" />
          </div>
        </div>

        {/* Raw Materials Warning */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stok Bahan Baku</p>
            <h3 className={`text-2xl font-black mt-1 ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {lowStockCount} Menipis
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Dari total {rawMaterials.length} jenis bahan</p>
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              lowStockCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Middle Row: Top Selling & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Dishes */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">Menu Terlaris (Top Selling Items)</h3>
            <span className="text-[11px] text-slate-400 font-medium">Berdasarkan volume transaksi</span>
          </div>

          <div className="space-y-3">
            {topSelling.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Belum ada data penjualan tercatat.</p>
            ) : (
              topSelling.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-black text-xs text-slate-400 w-4 text-center">#{idx + 1}</span>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{item.name}</h4>
                      <p className="text-[11px] text-slate-500">Terjual: {item.count} porsi</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-xs text-slate-900">${item.revenue.toFixed(2)}</span>
                    <p className="text-[10px] text-emerald-600 font-semibold">Omset</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Restaurant Info */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-800">Informasi Restoran & Kasir</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Nama Outlet</span>
              <p className="font-bold text-slate-800">RESTO POS DELUXE</p>
              <p className="text-slate-500 text-[11px]">Cabang Senopati, Jakarta Selatan</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Fitur Aktif</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                  Cetak Thermal 80mm
                </span>
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-bold text-[10px]">
                  Export PDF
                </span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold text-[10px]">
                  Auto Cut Baku
                </span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">
                  QRIS Ready
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Pajak & Servis</span>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Pajak Restoran (PB1):</span>
                <span className="font-bold text-slate-800">10%</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Biaya Layanan (Service):</span>
                <span className="font-bold text-slate-800">5% (Dine In)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-3 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-800">Riwayat Semua Transaksi Kasir</h3>
            <p className="text-xs text-slate-500">Cetak ulang struk atau download file PDF langsung dari tabel</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari no invoice, pelanggan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3 px-3">No. Invoice</th>
                <th className="py-3 px-3">Waktu</th>
                <th className="py-3 px-3">Tipe / Meja</th>
                <th className="py-3 px-3">Pelanggan</th>
                <th className="py-3 px-3">Metode</th>
                <th className="py-3 px-3">Total</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Aksi Struk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-bold font-mono text-slate-900">{order.invoiceNumber}</td>
                  <td className="py-3 px-3 text-slate-500 text-[11px]">{order.createdAt}</td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-800">{order.orderType}</span>{' '}
                    <span className="text-[11px] text-slate-400">{order.tableNumber !== '-' ? `(${order.tableNumber})` : ''}</span>
                  </td>
                  <td className="py-3 px-3">{order.customer}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium text-[11px]">
                      {order.paymentMethod || 'Belum Bayar'}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-extrabold text-slate-900">${order.totalPayable.toFixed(2)}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'running'
                          ? 'bg-amber-100 text-amber-800'
                          : order.status === 'draft'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {order.status === 'completed'
                        ? 'Selesai'
                        : order.status === 'running'
                        ? 'Berjalan'
                        : order.status === 'draft'
                        ? 'Draft'
                        : 'Batal'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewReceipt(order)}
                        title="Lihat & Cetak Struk"
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors border border-slate-200"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-600" />
                        <span>Cetak</span>
                      </button>
                      <button
                        onClick={() => generateReceiptPdf(order)}
                        title="Download Struk PDF"
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
