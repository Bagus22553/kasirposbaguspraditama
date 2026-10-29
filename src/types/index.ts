export interface RecipeIngredient {
  rawMaterialId: string;
  qty: number;
}

export interface MenuItem {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  image: string;
  status: 'available' | 'sold_out';
  comboDescription?: string;
  recipe?: RecipeIngredient[];
  description?: string;
}

export interface RawMaterial {
  id: string;
  code: string;
  name: string;
  category: string;
  stock: number;
  unit: 'kg' | 'gram' | 'liter' | 'ml' | 'pcs' | 'pack';
  minStock: number;
  unitCost: number;
  lastRestockDate: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  qty: number;
  discount: number;
  subtotal: number;
  note?: string;
  comboDescription?: string;
}

export type OrderType = 'Dine In' | 'Take Away' | 'Delivery' | 'Table';

export interface Order {
  id: string;
  invoiceNumber: string;
  orderType: OrderType;
  tableNumber: string;
  waiter: string;
  customer: string;
  items: OrderItem[];
  subtotal: number;
  discountTotal: number;
  tax: number;
  service: number;
  totalPayable: number;
  status: 'running' | 'draft' | 'completed' | 'cancelled';
  paymentMethod?: 'Cash' | 'QRIS' | 'Debit Card' | 'Credit Card';
  cashReceived?: number;
  change?: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  visits: number;
}

export interface TableItem {
  id: string;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  activeOrderId?: string;
}
