import React, { useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Edit,
  User,
  Calendar,
  Eye,
  X,
  FileText,
  Zap,
  CheckCircle,
  QrCode,
  Menu,
  ChevronDown,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { MenuItem, Order, OrderItem, OrderType, Customer, TableItem } from '../types';

interface PosViewProps {
  menuItems: MenuItem[];
  currentOrder: Order;
  runningOrdersCount: number;
  customers: Customer[];
  tables: TableItem[];
  waiters: string[];
  isTabletBezel: boolean;
  onToggleBezel: () => void;
  onUpdateCurrentOrder: (order: Order) => void;
  onAddItemToOrder: (menuItem: MenuItem) => void;
  onRemoveItemFromOrder: (itemId: string) => void;
  onUpdateItemQty: (itemId: string, delta: number) => void;
  onUpdateItemDiscount: (itemId: string, discount: number) => void;
  onCancelOrder: () => void;
  onDraftOrder: () => void;
  onQuickInvoice: () => void;
  onPlaceOrder: () => void;
  onOpenRunningOrders: () => void;
  onOpenCustomerModal: () => void;
  onOpenTableModal: () => void;
  onOpenOthersMenu: () => void;
  onViewReceiptPreview: () => void;
}

export const PosView: React.FC<PosViewProps> = ({
  menuItems,
  currentOrder,
  runningOrdersCount,
  customers,
  tables,
  waiters,
  isTabletBezel,
  onToggleBezel,
  onUpdateCurrentOrder,
  onAddItemToOrder,
  onRemoveItemFromOrder,
  onUpdateItemQty,
  onUpdateItemDiscount,
  onCancelOrder,
  onDraftOrder,
  onQuickInvoice,
  onPlaceOrder,
  onOpenRunningOrders,
  onOpenCustomerModal,
  onOpenTableModal,
  onOpenOthersMenu,
  onViewReceiptPreview,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [quickItemModal, setQuickItemModal] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');

  const categories = ['All', 'Food', 'Pasta', 'Curry', 'Combo', 'Appetizer', 'Soup', 'Dessert', 'Beverage'];

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      item.name.toLowerCase().includes(term) ||
      item.code.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term);
    const matchCat = selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchSearch && matchCat;
  });

  const handleOrderTypeChange = (type: OrderType) => {
    onUpdateCurrentOrder({
      ...currentOrder,
      orderType: type,
    });
  };

  const handleWaiterChange = (waiter: string) => {
    onUpdateCurrentOrder({
      ...currentOrder,
      waiter,
    });
  };

  const handleCustomerChange = (customer: string) => {
    onUpdateCurrentOrder({
      ...currentOrder,
      customer,
    });
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName || !customItemPrice) return;
    const priceNum = parseFloat(customItemPrice) || 0;
    const newItem: OrderItem = {
      id: `custom-${Date.now()}`,
      menuItemId: `custom-${Date.now()}`,
      name: customItemName.trim(),
      price: priceNum,
      qty: 1,
      discount: 0,
      subtotal: priceNum,
    };

    const newItems = [...currentOrder.items, newItem];
    const subtotal = newItems.reduce((acc, i) => acc + i.subtotal, 0);
    const tax = subtotal * 0.1;
    const service = currentOrder.orderType === 'Dine In' ? subtotal * 0.05 : 0;
    const totalPayable = subtotal + tax + service;

    onUpdateCurrentOrder({
      ...currentOrder,
      items: newItems,
      subtotal,
      tax,
      service,
      totalPayable,
    });

    setCustomItemName('');
    setCustomItemPrice('');
    setQuickItemModal(false);
  };

  return (
    <div className="flex flex-col h-full select-none bg-slate-50">
      {/* Top Colorful POS Action Bar - Exactly as in the Screenshot */}
      <div className="bg-slate-900/95 px-3 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 shrink-0">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Running Orders (Red) */}
          <button
            onClick={onOpenRunningOrders}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#e73939] hover:bg-red-600 text-white font-bold text-xs rounded-md shadow-xs active:scale-95 transition-all"
          >
            <span className="text-[11px] bg-red-800/80 px-1.5 py-0.2 rounded-full font-bold">
              {runningOrdersCount}
            </span>
            <span>Running Orders</span>
          </button>

          {/* Type (Purple) */}
          <div className="relative">
            <button
              onClick={() => {
                const nextType: Record<OrderType, OrderType> = {
                  'Dine In': 'Take Away',
                  'Take Away': 'Delivery',
                  'Delivery': 'Table',
                  'Table': 'Dine In',
                };
                handleOrderTypeChange(nextType[currentOrder.orderType]);
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#93278f] hover:bg-purple-700 text-white font-semibold text-xs rounded-md shadow-xs active:scale-95 transition-all"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Type: {currentOrder.orderType}</span>
            </button>
          </div>

          {/* Customer (Pink) */}
          <button
            onClick={onOpenCustomerModal}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#e91e63] hover:bg-pink-600 text-white font-semibold text-xs rounded-md shadow-xs active:scale-95 transition-all"
          >
            <User className="w-3.5 h-3.5" />
            <span>Customer</span>
          </button>

          {/* Blue Pencil / Quick Note */}
          <button
            onClick={() => {
              const note = prompt('Catatan pesanan / Order Note:', currentOrder.items[0]?.note || '');
              if (note !== null && currentOrder.items.length > 0) {
                const updated = [...currentOrder.items];
                updated[0] = { ...updated[0], note };
                onUpdateCurrentOrder({ ...currentOrder, items: updated });
              }
            }}
            title="Tambah Catatan Order"
            className="w-8 h-8 flex items-center justify-center bg-[#0288d1] hover:bg-sky-600 text-white rounded-md shadow-xs active:scale-95 transition-all"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>

          {/* Yellow Plus / Quick Custom Item */}
          <button
            onClick={() => setQuickItemModal(true)}
            title="Tambah Item Kustom Cepat"
            className="w-8 h-8 flex items-center justify-center bg-[#fbc02d] hover:bg-amber-500 text-slate-900 font-bold rounded-md shadow-xs active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Purple QR / Split Bill */}
          <button
            onClick={onQuickInvoice}
            title="Scan QR / Quick Checkout"
            className="w-8 h-8 flex items-center justify-center bg-[#7b1fa2] hover:bg-purple-800 text-white rounded-md shadow-xs active:scale-95 transition-all"
          >
            <QrCode className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Waiter (Slate / Gray) */}
          <div className="relative">
            <select
              value={currentOrder.waiter}
              onChange={(e) => handleWaiterChange(e.target.value)}
              className="appearance-none pl-7 pr-6 py-1.5 bg-[#546e7a] hover:bg-[#455a64] text-white font-semibold text-xs rounded-md shadow-xs cursor-pointer focus:outline-none"
            >
              {waiters.map((w) => (
                <option key={w} value={w} className="bg-slate-800 text-white">
                  Waiter: {w}
                </option>
              ))}
            </select>
            <Edit className="w-3 h-3 text-slate-200 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3 h-3 text-slate-200 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Others (Green) */}
          <button
            onClick={onOpenOthersMenu}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#7cb342] hover:bg-lime-600 text-white font-bold text-xs rounded-md shadow-xs active:scale-95 transition-all"
          >
            <Menu className="w-3.5 h-3.5" />
            <span>Others</span>
          </button>

          {/* Frame Toggle */}
          <button
            onClick={onToggleBezel}
            title={isTabletBezel ? 'Layar Penuh (Full Screen)' : 'Tampilan Bingkai Tablet'}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            {isTabletBezel ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* LEFT COLUMN: ORDER BILLING & ACTIONS */}
        <div className="w-full md:w-[48%] lg:w-[45%] flex flex-col bg-white border-r border-slate-200 h-full">
          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-4 p-2 gap-1.5 bg-slate-100/90 border-b border-slate-200 shrink-0">
            {(['Dine In', 'Take Away', 'Delivery', 'Table'] as OrderType[]).map((type) => {
              const isActive = currentOrder.orderType === type;
              return (
                <button
                  key={type}
                  onClick={() => {
                    if (type === 'Table') {
                      onOpenTableModal();
                    } else {
                      handleOrderTypeChange(type);
                    }
                  }}
                  className={`py-1.5 px-2 rounded font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                    isActive
                      ? 'bg-slate-300/90 text-slate-900 shadow-xs border border-slate-300'
                      : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
                  }`}
                >
                  <span className="text-[10px]">
                    {type === 'Dine In' && '▦'}
                    {type === 'Take Away' && '🛍'}
                    {type === 'Delivery' && '🚚'}
                    {type === 'Table' && '▦'}
                  </span>
                  <span>{type}</span>
                </button>
              );
            })}
          </div>

          {/* Waiter & Customer Sub-row */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2 shrink-0">
            {/* Waiter dropdown */}
            <div className="flex-1 relative">
              <select
                value={currentOrder.waiter}
                onChange={(e) => handleWaiterChange(e.target.value)}
                className="w-full py-1.5 pl-3 pr-6 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700 appearance-none focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                {waiters.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Customer dropdown */}
            <div className="flex-1 relative">
              <select
                value={currentOrder.customer}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full py-1.5 pl-3 pr-6 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700 appearance-none focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Edit / Customer modal button */}
            <button
              onClick={onOpenCustomerModal}
              title="Edit Pelanggan"
              className="p-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-slate-600"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>

            {/* Add customer button */}
            <button
              onClick={onOpenCustomerModal}
              title="Tambah Pelanggan Baru"
              className="p-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-slate-700 font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Table Badge info if Dine In / Table */}
          {currentOrder.orderType === 'Dine In' && (
            <div className="px-3 py-1 bg-amber-50/70 border-b border-amber-100 text-[11px] text-amber-900 flex justify-between items-center">
              <span>
                Lokasi Meja: <strong className="font-bold">{currentOrder.tableNumber}</strong>
              </span>
              <button
                onClick={onOpenTableModal}
                className="text-[10px] font-bold text-amber-700 underline hover:text-amber-800"
              >
                Ganti Meja
              </button>
            </div>
          )}

          {/* Ordered Items Table Header */}
          <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 grid grid-cols-12 text-[11px] font-bold text-slate-700 shrink-0">
            <div className="col-span-5">Item</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-1 text-center">Discount</div>
            <div className="col-span-2 text-right pr-2">Total</div>
          </div>

          {/* Items Table Body */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-h-[180px]">
            {currentOrder.items.length === 0 ? (
              <div className="text-center py-12 text-slate-400 flex flex-col items-center justify-center h-full">
                <p className="text-sm font-semibold">Pesanan Kosong</p>
                <p className="text-xs text-slate-400 mt-1">Pilih menu dari katalog di sebelah kanan untuk menambahkan.</p>
              </div>
            ) : (
              currentOrder.items.map((item) => (
                <div key={item.id} className="p-2.5 hover:bg-slate-50 transition-colors">
                  <div className="grid grid-cols-12 items-center text-xs">
                    {/* Item Name & Edit Icon */}
                    <div className="col-span-5 flex items-start gap-1 pr-1">
                      <button
                        onClick={() => {
                          const newName = prompt('Rename / Ubah Nama Item:', item.name);
                          if (newName && newName.trim()) {
                            const updated = currentOrder.items.map((i) =>
                              i.id === item.id ? { ...i, name: newName.trim() } : i
                            );
                            onUpdateCurrentOrder({ ...currentOrder, items: updated });
                          }
                        }}
                        title="Edit / Rename Item"
                        className="p-0.5 text-slate-400 hover:text-slate-700 mt-0.5 shrink-0"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-800 leading-snug line-clamp-2">{item.name}</span>
                        {item.comboDescription && (
                          <p className="text-[10px] text-slate-400 italic mt-0.5 line-clamp-1 leading-tight">
                            {item.comboDescription}
                          </p>
                        )}
                        {item.note && (
                          <p className="text-[10px] text-amber-600 font-medium italic mt-0.5">
                            Note: {item.note}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-2 text-center font-medium text-slate-700 text-xs">
                      {item.price.toFixed(2)}
                    </div>

                    {/* Qty Controls */}
                    <div className="col-span-2 flex items-center justify-center gap-1">
                      <button
                        onClick={() => onUpdateItemQty(item.id, -1)}
                        className="w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="w-4 text-center font-bold text-xs">{item.qty}</span>
                      <button
                        onClick={() => onUpdateItemQty(item.id, 1)}
                        className="w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Discount button */}
                    <div className="col-span-1 text-center">
                      <button
                        onClick={() => {
                          const val = prompt(`Diskon untuk ${item.name} ($):`, item.discount.toString());
                          if (val !== null) {
                            onUpdateItemDiscount(item.id, parseFloat(val) || 0);
                          }
                        }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                          item.discount > 0
                            ? 'bg-rose-50 border-rose-200 text-rose-700'
                            : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                      >
                        Amt
                      </button>
                    </div>

                    {/* Total & Delete Button */}
                    <div className="col-span-2 flex items-center justify-end gap-1.5 pl-1">
                      <span className="font-bold text-slate-900 text-xs">{item.subtotal.toFixed(2)}</span>
                      <button
                        onClick={() => onRemoveItemFromOrder(item.id)}
                        title="Hapus dari pesanan"
                        className="w-4 h-4 rounded-full bg-rose-400 hover:bg-rose-600 text-white flex items-center justify-center text-[10px] shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Total Payable Strip */}
          <div className="px-4 py-2 bg-slate-200/80 border-t border-slate-300 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 text-slate-600">
              <button type="button" title="Tanggal Transaksi" className="hover:text-slate-900 transition-colors">
                <Calendar className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onViewReceiptPreview}
                title="Pratinjau Struk Kasir"
                className="hover:text-slate-900 transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-slate-800 tracking-tight">
                Total Payable: {currentOrder.totalPayable.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Bottom Action Buttons (Exact colors matching image: Cancel [Red], Draft [Purple], Quick Invoice [Blue], Place Order [Green]) */}
          <div className="p-2 grid grid-cols-4 gap-1.5 bg-slate-100 border-t border-slate-200 shrink-0">
            {/* Cancel (Red) */}
            <button
              onClick={onCancelOrder}
              className="py-2.5 px-2 bg-[#e53935] hover:bg-red-700 active:scale-95 text-white font-bold text-xs rounded-md shadow-xs flex items-center justify-center gap-1 transition-all"
            >
              <X className="w-3.5 h-3.5 stroke-[3]" />
              <span>Cancel</span>
            </button>

            {/* Draft (Purple) */}
            <button
              onClick={onDraftOrder}
              className="py-2.5 px-2 bg-[#8e24aa] hover:bg-purple-800 active:scale-95 text-white font-bold text-xs rounded-md shadow-xs flex items-center justify-center gap-1 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Draft</span>
            </button>

            {/* Quick Invoice (Blue) */}
            <button
              onClick={onQuickInvoice}
              className="py-2.5 px-2 bg-[#039be5] hover:bg-sky-700 active:scale-95 text-white font-bold text-xs rounded-md shadow-xs flex items-center justify-center gap-1 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Quick Invoice</span>
            </button>

            {/* Place Order (Green) */}
            <button
              onClick={onPlaceOrder}
              className="py-2.5 px-2 bg-[#7cb342] hover:bg-lime-700 active:scale-95 text-white font-bold text-xs rounded-md shadow-xs flex items-center justify-center gap-1 transition-all"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Place Order</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: CATALOG & PRODUCT CARDS */}
        <div className="flex-1 flex flex-col bg-slate-100/70 overflow-hidden">
          {/* Search Bar & Category Dropdown */}
          <div className="p-2.5 bg-white border-b border-slate-200 flex items-center gap-2 shrink-0">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Name or Code or Category or VEG or BEV or BAR"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
            </div>

            {/* Category Button (Purple Dropdown as in Screenshot) */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8e24aa] hover:bg-purple-800 text-white font-bold text-xs rounded shadow-xs transition-colors shrink-0"
              >
                <span>Category: {selectedCategory}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showCategoryMenu && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setShowCategoryMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-purple-50 hover:text-purple-700 transition-colors ${
                        selectedCategory === cat ? 'bg-purple-100 text-purple-800 font-bold' : 'text-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Price Row (similar to top strip in screenshot) */}
          <div className="px-3 py-1.5 bg-slate-200/50 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-medium shrink-0">
            <span>Price: 2.00</span>
            <span>Price: 35.00</span>
            <span>Price: 8.00</span>
          </div>

          {/* Product Cards Grid: 3 columns matching image! */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredItems.map((item) => {
                const isSoldOut = item.status === 'sold_out';
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!isSoldOut) {
                        onAddItemToOrder(item);
                      }
                    }}
                    className={`group bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col justify-between ${
                      isSoldOut ? 'opacity-50 cursor-not-allowed' : 'active:scale-98'
                    }`}
                  >
                    {/* Item Image */}
                    <div className="relative h-28 bg-slate-100 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      {isSoldOut && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Item Info */}
                    <div className="p-2.5 text-center flex-1 flex flex-col justify-between">
                      <h4 className="font-semibold text-xs text-slate-800 line-clamp-1 group-hover:text-purple-700 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">
                        Price: {item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <Search className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-xs">Menu tidak ditemukan</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Coba gunakan kata kunci pencarian lain.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Custom Item Modal */}
      {quickItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-3.5 bg-amber-500 text-slate-900 flex justify-between items-center font-bold text-sm">
              <span>Tambah Item Kustom (Manual)</span>
              <button onClick={() => setQuickItemModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddCustomItem} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Item *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Jus Spesial / Extra Nasi"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Harga ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="3.50"
                  value={customItemPrice}
                  onChange={(e) => setCustomItemPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickItemModal(false)}
                  className="flex-1 py-2 text-xs border border-slate-200 text-slate-600 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg shadow-xs"
                >
                  Tambahkan ke Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
