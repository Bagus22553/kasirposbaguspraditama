import { jsPDF } from 'jspdf';
import { Order } from '../types';

export function generateReceiptPdf(order: Order, restaurantName = 'RESTO POS DELUXE') {
  // Thermal paper width is roughly 80mm. Let's create an 80mm width page with dynamic height or standard receipt format!
  // In jsPDF: unit: 'mm', format: [80, dynamicHeight]
  const baseHeight = 150 + (order.items.length * 9);
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, Math.max(160, baseHeight)],
  });

  doc.setFont('courier', 'normal');

  let y = 10;
  const centerX = 40;

  // Header
  doc.setFontSize(13);
  doc.setFont('courier', 'bold');
  doc.text(restaurantName, centerX, y, { align: 'center' });
  y += 5;

  doc.setFontSize(7.5);
  doc.setFont('courier', 'normal');
  doc.text('Jl. Senopati Culinary No. 88, Jakarta', centerX, y, { align: 'center' });
  y += 3.5;
  doc.text('Telp: (021) 789-2233 | IG: @restopos', centerX, y, { align: 'center' });
  y += 4;

  // Dashed separator
  doc.text('------------------------------------------', centerX, y, { align: 'center' });
  y += 4;

  // Order Info
  doc.setFontSize(7.5);
  doc.text(`Invoice : ${order.invoiceNumber}`, 6, y);
  y += 3.5;
  doc.text(`Waktu   : ${order.createdAt}`, 6, y);
  y += 3.5;
  doc.text(`Kasir   : ${order.waiter}`, 6, y);
  y += 3.5;
  doc.text(`Tipe    : ${order.orderType} ${order.tableNumber !== '-' ? `(${order.tableNumber})` : ''}`, 6, y);
  y += 3.5;
  doc.text(`Pelanggan: ${order.customer}`, 6, y);
  y += 4;

  doc.text('------------------------------------------', centerX, y, { align: 'center' });
  y += 4;

  // Items List
  doc.setFont('courier', 'bold');
  doc.text('ITEM', 6, y);
  doc.text('QTY x HRG', 42, y);
  doc.text('TOTAL', 74, y, { align: 'right' });
  y += 3.5;
  doc.text('------------------------------------------', centerX, y, { align: 'center' });
  y += 3.5;

  doc.setFont('courier', 'normal');
  order.items.forEach((item) => {
    // Truncate name if long
    const itemName = item.name.length > 20 ? item.name.substring(0, 18) + '..' : item.name;
    doc.text(itemName, 6, y);
    y += 3.2;

    const qtyPrice = `${item.qty} x $${item.price.toFixed(2)}`;
    const lineTotal = `$${item.subtotal.toFixed(2)}`;
    doc.text(qtyPrice, 10, y);
    doc.text(lineTotal, 74, y, { align: 'right' });
    y += 4;
  });

  doc.text('------------------------------------------', centerX, y, { align: 'center' });
  y += 4;

  // Totals
  doc.text('Subtotal:', 30, y);
  doc.text(`$${order.subtotal.toFixed(2)}`, 74, y, { align: 'right' });
  y += 3.5;

  if (order.discountTotal > 0) {
    doc.text('Diskon:', 30, y);
    doc.text(`-$${order.discountTotal.toFixed(2)}`, 74, y, { align: 'right' });
    y += 3.5;
  }

  doc.text('Pajak (Tax 10%):', 30, y);
  doc.text(`$${order.tax.toFixed(2)}`, 74, y, { align: 'right' });
  y += 3.5;

  if (order.service > 0) {
    doc.text('Service (5%):', 30, y);
    doc.text(`$${order.service.toFixed(2)}`, 74, y, { align: 'right' });
    y += 3.5;
  }

  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.text('TOTAL PAYABLE:', 20, y);
  doc.text(`$${order.totalPayable.toFixed(2)}`, 74, y, { align: 'right' });
  y += 4.5;

  doc.setFontSize(7.5);
  doc.setFont('courier', 'normal');
  doc.text('------------------------------------------', centerX, y, { align: 'center' });
  y += 4;

  // Payment
  if (order.paymentMethod) {
    doc.text(`Metode Bayar : ${order.paymentMethod}`, 6, y);
    y += 3.5;
    if (order.cashReceived) {
      doc.text(`Diterima     : $${order.cashReceived.toFixed(2)}`, 6, y);
      y += 3.5;
    }
    if (order.change !== undefined) {
      doc.text(`Kembalian    : $${order.change.toFixed(2)}`, 6, y);
      y += 4;
    }
    doc.text('------------------------------------------', centerX, y, { align: 'center' });
    y += 4;
  }

  // Footer Message
  doc.setFontSize(7);
  doc.text('TERIMA KASIH ATAS KUNJUNGAN ANDA', centerX, y, { align: 'center' });
  y += 3.5;
  doc.text('Simpan struk ini sebagai bukti bayar sah', centerX, y, { align: 'center' });
  y += 3.5;
  doc.text('Wifi: RestoFree | Pass: nikmatlezat', centerX, y, { align: 'center' });
  y += 4;
  doc.text('* * * LUNAS * * *', centerX, y, { align: 'center' });

  // Trigger download
  doc.save(`Struk-${order.invoiceNumber}.pdf`);
}
