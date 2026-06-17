import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { jsPDF } from 'jspdf';

import { Auth } from '../services/auth';
import { Product, ProductDTO } from '../services/product';

interface InvoiceOrder {
  id?: number;
  orderId?: number;
  productId: number;
  customerId: number;
  quantity: number;
  totalAmount: number;
  orderStatus?: string;
  paymentStatus?: string;
}

interface ShippingAddress {
  fullName: string;
  mobile: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

@Component({
  selector: 'app-invoice',
  standalone: false,
  templateUrl: './invoice.html',
  styleUrl: './invoice.css'
})
export class Invoice implements OnInit {

  order?: InvoiceOrder;
  product?: ProductDTO;
  address?: ShippingAddress;
  isLoading = false;
  errorMessage = '';
  invoiceDate = new Date();

  private orderApiUrl = 'http://localhost:9090/api/orders';

  constructor(
    public auth: Auth,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private productService: Product,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const orderId = Number(this.route.snapshot.paramMap.get('orderId'));

    if (!orderId) {
      this.errorMessage = 'Invalid order selected';
      return;
    }

    this.loadInvoice(orderId);
  }

  loadInvoice(orderId: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    const localOrder = this.getOrderSnapshot(orderId);
    this.address = this.getOrderAddress(orderId);
    this.product = this.getProductSnapshot(orderId);

    if (localOrder) {
      this.order = localOrder;
      this.loadProduct(localOrder.productId);
      return;
    }

    this.http.get<InvoiceOrder>(`${this.orderApiUrl}/${orderId}`).pipe(
      timeout(3000),
      catchError((error) => {
        console.log('Invoice order load fallback:', error);
        return of(undefined);
      })
    ).subscribe({
      next: (data) => {
        if (!data) {
          this.errorMessage = 'Unable to load invoice details';
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }

        this.order = data;
        this.saveOrderSnapshot(data);
        this.loadProduct(data.productId);
      },
      error: () => {
        this.errorMessage = 'Unable to load invoice details';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadProduct(productId: number): void {
    if (!productId) {
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.productService.getProductById(productId).pipe(
      timeout(3000),
      catchError(() => of(this.getProductSnapshot(this.getOrderId())))
    ).subscribe({
      next: (data) => {
        this.product = data || this.product;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.product = this.getProductSnapshot(this.getOrderId());
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  downloadInvoice(): void {
    if (!this.order) {
      return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const left = 18;
    const right = pageWidth - 18;
    let y = 18;

    pdf.setFillColor(40, 116, 240);
    pdf.roundedRect(left, y, 16, 16, 4, 4, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('J', left + 6, y + 11);

    pdf.setTextColor(40, 116, 240);
    pdf.setFontSize(26);
    pdf.setFont('helvetica', 'bold');
    pdf.text('JKart', left + 22, y + 8);

    pdf.setTextColor(70, 83, 105);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Multi-Vendor Marketplace', left + 22, y + 15);

    pdf.setTextColor(23, 35, 55);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Invoice', right, y + 8, { align: 'right' });

    pdf.setTextColor(70, 83, 105);
    pdf.setFontSize(11);
    pdf.text(`INV-${this.getOrderId()}`, right, y + 15, { align: 'right' });

    y += 28;
    pdf.setDrawColor(226, 232, 240);
    pdf.line(left, y, right, y);

    y += 12;
    this.drawInfoBox(pdf, left, y, 54, 'Invoice Date', this.invoiceDate.toLocaleDateString());
    this.drawInfoBox(pdf, left + 60, y, 54, 'Order ID', `#${this.getOrderId()}`);
    this.drawInfoBox(pdf, left + 120, y, 54, 'Payment Status', this.getPaymentStatus());

    y += 30;
    this.drawSectionTitle(pdf, 'Customer Details', left, y);
    y += 8;
    this.drawInfoBox(pdf, left, y, 82, 'Customer ID', String(this.order.customerId));
    this.drawInfoBox(pdf, left + 90, y, 82, 'Customer Email', this.auth.getEmail() || 'Not available');

    y += 30;
    this.drawSectionTitle(pdf, 'Delivery Address', left, y);
    y += 8;
    const addressText = this.getAddressText();
    const addressLines = pdf.splitTextToSize(addressText, 165);
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(left, y, 174, 22 + (addressLines.length * 4), 3, 3, 'F');
    pdf.setTextColor(23, 35, 55);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(addressLines, left + 4, y + 8);

    y += 32 + (addressLines.length * 4);
    this.drawSectionTitle(pdf, 'Product Details', left, y);
    y += 8;
    const productLines = pdf.splitTextToSize(`${this.getProductName()} | ${this.getProductCategory()} | Vendor: ${this.getVendorName()}`, 165);
    pdf.setFillColor(238, 246, 255);
    pdf.roundedRect(left, y, 174, 18 + (productLines.length * 4), 3, 3, 'F');
    pdf.setTextColor(23, 35, 55);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(productLines, left + 4, y + 8);

    y += 28 + (productLines.length * 4);
    this.drawSectionTitle(pdf, 'Order Details', left, y);
    y += 10;

    const tableX = left;
    const colWidths = [48, 32, 22, 32, 32, 28];
    const headers = ['Product', 'Unit Price', 'Qty', 'Order Status', 'Payment', 'Total'];
    const values = [
      this.getProductName(),
      `Rs. ${this.getUnitPrice().toFixed(2)}`,
      String(this.order.quantity),
      this.getOrderStatus(),
      this.getPaymentStatus(),
      `Rs. ${this.order.totalAmount}`
    ];

    this.drawTableRow(pdf, tableX, y, colWidths, headers, true);
    y += 12;
    this.drawTableRow(pdf, tableX, y, colWidths, values, false);

    y += 24;
    pdf.setDrawColor(226, 232, 240);
    pdf.line(left, y, right, y);

    y += 14;
    pdf.setTextColor(70, 83, 105);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Grand Total', right - 55, y);

    pdf.setTextColor(23, 35, 55);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Rs. ${this.order.totalAmount}`, right, y, { align: 'right' });

    y += 24;
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Thank you for shopping with JKart.', left, y);
    pdf.text('This is a system generated invoice.', left, y + 7);

    pdf.save(`JKart-Invoice-${this.getOrderId()}.pdf`);
  }

  printInvoice(): void {
    this.downloadInvoice();
  }

  drawSectionTitle(pdf: jsPDF, title: string, x: number, y: number): void {
    pdf.setTextColor(23, 35, 55);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, x, y);
  }

  drawInfoBox(pdf: jsPDF, x: number, y: number, width: number, label: string, value: string): void {
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(x, y, width, 20, 3, 3, 'F');

    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(label, x + 4, y + 7);

    pdf.setTextColor(23, 35, 55);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    const lines = pdf.splitTextToSize(value || 'Not available', width - 8);
    pdf.text(lines, x + 4, y + 14);
  }

  drawTableRow(pdf: jsPDF, x: number, y: number, widths: number[], values: string[], isHeader: boolean): void {
    let currentX = x;

    values.forEach((value, index) => {
      const width = widths[index];

      if (isHeader) {
        pdf.setFillColor(248, 250, 252);
      } else {
        pdf.setFillColor(255, 255, 255);
      }

      pdf.setDrawColor(226, 232, 240);
      pdf.rect(currentX, y, width, 12, 'FD');

      pdf.setTextColor(23, 35, 55);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', isHeader ? 'bold' : 'normal');
      const lines = pdf.splitTextToSize(value || '-', width - 4);
      pdf.text(lines.slice(0, 2), currentX + 2, y + 5);

      currentX += width;
    });
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }

  getOrderId(): number {
    return this.order?.id || this.order?.orderId || 0;
  }

  getProductName(): string {
    return this.product?.name || 'Product #' + this.order?.productId;
  }

  getProductCategory(): string {
    return this.product?.category || 'Category not available';
  }

  getVendorName(): string {
    return this.product?.vendor || 'Vendor not available';
  }

  getUnitPrice(): number {
    if (!this.order || this.order.quantity <= 0) {
      return 0;
    }

    return this.order.totalAmount / this.order.quantity;
  }

  getPaymentStatus(): string {
    const localStatus = this.getLocalPaymentStatus(this.getOrderId());
    return localStatus || this.order?.paymentStatus || 'PENDING';
  }

  getOrderStatus(): string {
    return this.order?.orderStatus || 'CONFIRMED';
  }

  getAddressText(): string {
    if (!this.address) {
      return 'Delivery address not available';
    }

    return `${this.address.fullName}, ${this.address.addressLine}, ${this.address.city}, ${this.address.state} - ${this.address.pincode}, Mobile: ${this.address.mobile}`;
  }

  getProductSnapshot(orderId: number): ProductDTO | undefined {
    const snapshots = JSON.parse(localStorage.getItem('orderProductSnapshots') || '{}');
    return snapshots[orderId];
  }

  getOrderAddress(orderId: number): ShippingAddress | undefined {
    const addresses = JSON.parse(localStorage.getItem('orderAddresses') || '{}');
    return addresses[orderId];
  }

  getOrderSnapshot(orderId: number): InvoiceOrder | undefined {
    const orders = JSON.parse(localStorage.getItem('orderSnapshots') || '{}');
    return orders[orderId];
  }

  saveOrderSnapshot(order: InvoiceOrder): void {
    const orderId = order.id || order.orderId || 0;

    if (!orderId) {
      return;
    }

    const orders = JSON.parse(localStorage.getItem('orderSnapshots') || '{}');
    orders[orderId] = order;
    localStorage.setItem('orderSnapshots', JSON.stringify(orders));
  }

  getLocalPaymentStatus(orderId: number): string {
    const paymentMap = JSON.parse(localStorage.getItem('orderPaymentStatus') || '{}');
    return paymentMap[orderId] || '';
  }
}


