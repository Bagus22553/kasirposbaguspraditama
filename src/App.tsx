/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  MenuItem,
  RawMaterial,
  Order,
  OrderItem,
  Customer,
  TableItem,
} from './types';
import {
  INITIAL_MENU_ITEMS,
  INITIAL_RAW_MATERIALS,
  INITIAL_TABLES,
  INITIAL_CUSTOMERS,
  INITIAL_ORDER_SAMPLE,
  INITIAL_COMPLETED_ORDERS,
  WAITERS,
} from './data/initialData';
import { AppHeader, NavTab } from './components/AppHeader';
import { PosView } from './components/PosView';
import { MenuManagement } from './components/MenuManagement';
import { RawMaterialsManagement } from './components/RawMaterialsManagement';
import { AdminDashboard } from './components/AdminDashboard';
import { ReceiptModal } from './components/ReceiptModal';
import { PaymentModal } from './components/PaymentModal';
import { RunningOrdersModal } from './components/RunningOrdersModal';
import { CustomerModal } from './components/CustomerModal';
import { TableModal } from './components/TableModal';

const createEmptyOrder = (orderNum: number): Order => ({
  id: `ord-${Date.now()}`,
  invoiceNumber: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(orderNum).padStart(4, '0')}`,
  orderType: 'Dine In',
  tableNumber: 'Meja 04',
  waiter: 'john',
  customer: 'Walk-in Customer',
  items: [],
  subtotal: 0,
  discountTotal: 0,
  tax: 0,
  service: 0,
  totalPayable: 0,
  status: 'running',
  createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
});

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<NavTab>('pos');
  const [isTabletBezel, setIsTabletBezel] = useState<boolean>(true);

  // Core Persistent State
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('restopos_menu');
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(() => {
    const saved = localStorage.getItem('restopos_raw');
    return saved ? JSON.parse(saved) : INITIAL_RAW_MATERIALS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('restopos_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [tables, setTables] = useState<TableItem[]>(() => {
    const saved = localStorage.getItem('restopos_tables');
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [runningOrders, setRunningOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('restopos_running_orders');
    return saved ? JSON.parse(saved) : [INITIAL_ORDER_SAMPLE];
  });

  const [completedOrders, setCompletedOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('restopos_completed_orders');
    return saved ? JSON.parse(saved) : INITIAL_COMPLETED_ORDERS;
  });

  // Current active order on POS screen
  const [currentOrder, setCurrentOrder] = useState<Order>(() => {
    const saved = localStorage.getItem('restopos_current_order');
    return saved ? JSON.parse(saved) : INITIAL_ORDER_SAMPLE;
  });

  // Modals state
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptTargetOrder, setReceiptTargetOrder] = useState<Order | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isRunningOrdersOpen, setIsRunningOrdersOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('restopos_menu', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('restopos_raw', JSON.stringify(rawMaterials));
  }, [rawMaterials]);

  useEffect(() => {
    localStorage.setItem('restopos_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('restopos_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('restopos_running_orders', JSON.stringify(runningOrders));
  }, [runningOrders]);

  useEffect(() => {
    localStorage.setItem('restopos_completed_orders', JSON.stringify(completedOrders));
  }, [completedOrders]);

  useEffect(() => {
    localStorage.setItem('restopos_current_order', JSON.stringify(currentOrder));
  }, [currentOrder]);

  // Recalculate order totals helper
  const recalculateOrder = (order: Order, items: OrderItem[]): Order => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const discountTotal = items.reduce((sum, item) => sum + item.discount, 0);
    const tax = subtotal * 0.1; // 10% PB1
    const service = order.orderType === 'Dine In' ? subtotal * 0.05 : 0; // 5% service charge for dine in
    const totalPayable = Math.max(0, subtotal - discountTotal + tax + service);

    return {
      ...order,
      items,
      subtotal,
      discountTotal,
      tax,
      service,
      totalPayable,
    };
  };

  // Add Item from Catalog to Current Order
  const handleAddItemToOrder = (menuItem: MenuItem) => {
    const existingIndex = currentOrder.items.findIndex((i) => i.menuItemId === menuItem.id);
    let newItems: OrderItem[];

    if (existingIndex >= 0) {
      newItems = currentOrder.items.map((item, idx) => {
        if (idx === existingIndex) {
          const nextQty = item.qty + 1;
          const subtotal = nextQty * item.price - item.discount;
          return { ...item, qty: nextQty, subtotal };
        }
        return item;
      });
    } else {
      const newItem: OrderItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        qty: 1,
        discount: 0,
        subtotal: menuItem.price,
        comboDescription: menuItem.comboDescription,
      };
      newItems = [...currentOrder.items, newItem];
    }

    const updated = recalculateOrder(currentOrder, newItems);
    setCurrentOrder(updated);
  };

  // Update Item Qty
  const handleUpdateItemQty = (itemId: string, delta: number) => {
    const targetItem = currentOrder.items.find((i) => i.id === itemId);
    if (!targetItem) return;

    if (targetItem.qty + delta <= 0) {
      handleRemoveItemFromOrder(itemId);
      return;
    }

    const newItems = currentOrder.items.map((i) => {
      if (i.id === itemId) {
        const nextQty = i.qty + delta;
        const subtotal = nextQty * i.price - i.discount;
        return { ...i, qty: nextQty, subtotal };
      }
      return i;
    });

    const updated = recalculateOrder(currentOrder, newItems);
    setCurrentOrder(updated);
  };

  // Remove Item
  const handleRemoveItemFromOrder = (itemId: string) => {
    const newItems = currentOrder.items.filter((i) => i.id !== itemId);
    const updated = recalculateOrder(currentOrder, newItems);
    setCurrentOrder(updated);
  };

  // Update Item Discount
  const handleUpdateItemDiscount = (itemId: string, discount: number) => {
    const newItems = currentOrder.items.map((i) => {
      if (i.id === itemId) {
        const d = Math.max(0, discount);
        const subtotal = Math.max(0, i.qty * i.price - d);
        return { ...i, discount: d, subtotal };
      }
      return i;
    });
    const updated = recalculateOrder(currentOrder, newItems);
    setCurrentOrder(updated);
  };

  // Cancel Order
  const handleCancelOrder = () => {
    if (currentOrder.items.length === 0) return;
    if (confirm('Batalkan pesanan saat ini dan bersihkan daftar item?')) {
      // Remove from running orders if exists
      setRunningOrders((prev) => prev.filter((o) => o.id !== currentOrder.id));
      setCurrentOrder(createEmptyOrder(completedOrders.length + 1));
    }
  };

  // Draft Order
  const handleDraftOrder = () => {
    if (currentOrder.items.length === 0) {
      alert('Tambahkan item terlebih dahulu sebelum menyimpan draft.');
      return;
    }
    const draft: Order = {
      ...currentOrder,
      status: 'draft',
    };
    setRunningOrders((prev) => {
      const exists = prev.some((o) => o.id === draft.id);
      if (exists) {
        return prev.map((o) => (o.id === draft.id ? draft : o));
      }
      return [...prev, draft];
    });

    alert(`Pesanan ${draft.invoiceNumber} berhasil disimpan sebagai Draft!`);
    setCurrentOrder(createEmptyOrder(completedOrders.length + runningOrders.length + 2));
  };

  // Checkout & Payment Processing
  const handleProcessPayment = (
    method: 'Cash' | 'QRIS' | 'Debit Card' | 'Credit Card',
    cashReceived: number,
    change: number
  ) => {
    const completedOrder: Order = {
      ...currentOrder,
      status: 'completed',
      paymentMethod: method,
      cashReceived,
      change,
      createdAt: new Date().toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    // Deduct raw materials inventory based on menu items recipes!
    const updatedMaterials = [...rawMaterials];
    completedOrder.items.forEach((orderItem) => {
      const menu = menuItems.find((m) => m.id === orderItem.menuItemId);
      if (menu && menu.recipe && menu.recipe.length > 0) {
        menu.recipe.forEach((ingredient) => {
          const matIndex = updatedMaterials.findIndex((m) => m.id === ingredient.rawMaterialId);
          if (matIndex >= 0) {
            const deduction = ingredient.qty * orderItem.qty;
            const remaining = Math.max(0, updatedMaterials[matIndex].stock - deduction);
            updatedMaterials[matIndex] = {
              ...updatedMaterials[matIndex],
              stock: parseFloat(remaining.toFixed(2)),
            };
          }
        });
      }
    });
    setRawMaterials(updatedMaterials);

    // Add to completed orders
    setCompletedOrders((prev) => [completedOrder, ...prev]);

    // Remove from running orders
    setRunningOrders((prev) => prev.filter((o) => o.id !== currentOrder.id));

    // Close payment modal and open receipt modal for direct printing / pdf download!
    setIsPaymentOpen(false);
    setReceiptTargetOrder(completedOrder);
    setIsReceiptOpen(true);

    // Initialize fresh new order
    setCurrentOrder(createEmptyOrder(completedOrders.length + 2));
  };

  // CRUD Menu Handlers
  const handleAddMenuItem = (item: MenuItem) => {
    setMenuItems((prev) => [item, ...prev]);
  };

  const handleUpdateMenuItem = (item: MenuItem) => {
    setMenuItems((prev) => prev.map((m) => (m.id === item.id ? item : m)));
  };

  const handleDeleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((m) => m.id !== id));
  };

  // CRUD Raw Materials Handlers
  const handleAddRawMaterial = (material: RawMaterial) => {
    setRawMaterials((prev) => [material, ...prev]);
  };

  const handleUpdateRawMaterial = (material: RawMaterial) => {
    setRawMaterials((prev) => prev.map((m) => (m.id === material.id ? material : m)));
  };

  const handleDeleteRawMaterial = (id: string) => {
    setRawMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  // Reset Demo Data
  const handleResetData = () => {
    localStorage.clear();
    setMenuItems(INITIAL_MENU_ITEMS);
    setRawMaterials(INITIAL_RAW_MATERIALS);
    setCustomers(INITIAL_CUSTOMERS);
    setTables(INITIAL_TABLES);
    setRunningOrders([INITIAL_ORDER_SAMPLE]);
    setCompletedOrders(INITIAL_COMPLETED_ORDERS);
    setCurrentOrder(INITIAL_ORDER_SAMPLE);
    alert('Data demo berhasil di-reset!');
  };

  const lowStockCount = rawMaterials.filter((m) => m.stock <= m.minStock).length;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
      {/* Top Application Header */}
      <AppHeader
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        runningOrdersCount={runningOrders.length}
        lowStockCount={lowStockCount}
        isTabletBezel={isTabletBezel}
        onToggleBezel={() => setIsTabletBezel(!isTabletBezel)}
      />

      {/* Main App Body */}
      <main className="flex-1 flex flex-col p-2 sm:p-4 md:p-6 overflow-hidden">
        {currentTab === 'pos' && (
          <div className="flex-1 flex items-center justify-center w-full">
            {isTabletBezel ? (
              /* Realistic iPad / Tablet Bezel Container matching uploaded screenshot */
              <div className="w-full max-w-[1140px] aspect-[4/3] max-h-[88vh] bg-slate-950 p-4 md:p-5 rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border-4 border-slate-800 flex flex-col relative">
                {/* Camera punch hole on bezel */}
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-800 border border-slate-700/60 hidden md:block"></div>

                {/* Inner Screen */}
                <div className="w-full h-full rounded-[1.8rem] overflow-hidden bg-white shadow-inner flex flex-col">
                  <PosView
                    menuItems={menuItems}
                    currentOrder={currentOrder}
                    runningOrdersCount={runningOrders.length}
                    customers={customers}
                    tables={tables}
                    waiters={WAITERS}
                    isTabletBezel={isTabletBezel}
                    onToggleBezel={() => setIsTabletBezel(false)}
                    onUpdateCurrentOrder={setCurrentOrder}
                    onAddItemToOrder={handleAddItemToOrder}
                    onRemoveItemFromOrder={handleRemoveItemFromOrder}
                    onUpdateItemQty={handleUpdateItemQty}
                    onUpdateItemDiscount={handleUpdateItemDiscount}
                    onCancelOrder={handleCancelOrder}
                    onDraftOrder={handleDraftOrder}
                    onQuickInvoice={() => {
                      if (currentOrder.items.length === 0) {
                        alert('Pilih item menu terlebih dahulu.');
                        return;
                      }
                      setIsPaymentOpen(true);
                    }}
                    onPlaceOrder={() => {
                      if (currentOrder.items.length === 0) {
                        alert('Pilih item menu terlebih dahulu.');
                        return;
                      }
                      setIsPaymentOpen(true);
                    }}
                    onOpenRunningOrders={() => setIsRunningOrdersOpen(true)}
                    onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
                    onOpenTableModal={() => setIsTableModalOpen(true)}
                    onOpenOthersMenu={() => setCurrentTab('dashboard')}
                    onViewReceiptPreview={() => {
                      setReceiptTargetOrder(currentOrder);
                      setIsReceiptOpen(true);
                    }}
                  />
                </div>
              </div>
            ) : (
              /* Full Screen POS Mode */
              <div className="w-full h-[85vh] rounded-2xl overflow-hidden shadow-2xl bg-white border border-slate-800 flex flex-col">
                <PosView
                  menuItems={menuItems}
                  currentOrder={currentOrder}
                  runningOrdersCount={runningOrders.length}
                  customers={customers}
                  tables={tables}
                  waiters={WAITERS}
                  isTabletBezel={isTabletBezel}
                  onToggleBezel={() => setIsTabletBezel(true)}
                  onUpdateCurrentOrder={setCurrentOrder}
                  onAddItemToOrder={handleAddItemToOrder}
                  onRemoveItemFromOrder={handleRemoveItemFromOrder}
                  onUpdateItemQty={handleUpdateItemQty}
                  onUpdateItemDiscount={handleUpdateItemDiscount}
                  onCancelOrder={handleCancelOrder}
                  onDraftOrder={handleDraftOrder}
                  onQuickInvoice={() => {
                    if (currentOrder.items.length === 0) {
                      alert('Pilih item menu terlebih dahulu.');
                      return;
                    }
                    setIsPaymentOpen(true);
                  }}
                  onPlaceOrder={() => {
                    if (currentOrder.items.length === 0) {
                      alert('Pilih item menu terlebih dahulu.');
                      return;
                    }
                    setIsPaymentOpen(true);
                  }}
                  onOpenRunningOrders={() => setIsRunningOrdersOpen(true)}
                  onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
                  onOpenTableModal={() => setIsTableModalOpen(true)}
                  onOpenOthersMenu={() => setCurrentTab('dashboard')}
                  onViewReceiptPreview={() => {
                    setReceiptTargetOrder(currentOrder);
                    setIsReceiptOpen(true);
                  }}
                />
              </div>
            )}
          </div>
        )}

        {currentTab === 'dashboard' && (
          <div className="max-w-7xl w-full mx-auto overflow-y-auto">
            <AdminDashboard
              orders={[...runningOrders, ...completedOrders]}
              menuItems={menuItems}
              rawMaterials={rawMaterials}
              onViewReceipt={(order) => {
                setReceiptTargetOrder(order);
                setIsReceiptOpen(true);
              }}
              onResetData={handleResetData}
            />
          </div>
        )}

        {currentTab === 'menu' && (
          <div className="max-w-7xl w-full mx-auto overflow-y-auto">
            <MenuManagement
              menuItems={menuItems}
              rawMaterials={rawMaterials}
              onAddMenuItem={handleAddMenuItem}
              onUpdateMenuItem={handleUpdateMenuItem}
              onDeleteMenuItem={handleDeleteMenuItem}
            />
          </div>
        )}

        {currentTab === 'raw_materials' && (
          <div className="max-w-7xl w-full mx-auto overflow-y-auto">
            <RawMaterialsManagement
              rawMaterials={rawMaterials}
              onAddRawMaterial={handleAddRawMaterial}
              onUpdateRawMaterial={handleUpdateRawMaterial}
              onDeleteRawMaterial={handleDeleteRawMaterial}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <ReceiptModal
        order={receiptTargetOrder}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />

      <PaymentModal
        order={currentOrder}
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onProcessPayment={handleProcessPayment}
      />

      <RunningOrdersModal
        isOpen={isRunningOrdersOpen}
        onClose={() => setIsRunningOrdersOpen(false)}
        orders={runningOrders}
        onSelectOrder={(order) => setCurrentOrder(order)}
        onDeleteOrder={(orderId) => {
          setRunningOrders((prev) => prev.filter((o) => o.id !== orderId));
          if (currentOrder.id === orderId) {
            setCurrentOrder(createEmptyOrder(completedOrders.length + 1));
          }
        }}
        onViewReceipt={(order) => {
          setReceiptTargetOrder(order);
          setIsReceiptOpen(true);
        }}
      />

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customers={customers}
        selectedCustomer={currentOrder.customer}
        onSelectCustomer={(custName) => setCurrentOrder({ ...currentOrder, customer: custName })}
        onAddCustomer={(newCust) => setCustomers((prev) => [newCust, ...prev])}
      />

      <TableModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        tables={tables}
        selectedTable={currentOrder.tableNumber}
        onSelectTable={(tableName) =>
          setCurrentOrder({
            ...currentOrder,
            tableNumber: tableName,
            orderType: 'Dine In',
          })
        }
      />
    </div>
  );
}
