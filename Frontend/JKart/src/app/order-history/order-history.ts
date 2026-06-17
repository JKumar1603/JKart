import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

import { Auth } from '../services/auth';
import { Product, ProductDTO } from '../services/product';

interface OrderItem {
  id?: number;
  orderId?: number;
  productId: number;
  customerId: number;
  quantity: number;
  totalAmount: number;
  orderStatus?: string;
  paymentStatus?: string;
  product?: ProductDTO;
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
  selector: 'app-order-history',
  standalone: false,
  templateUrl: './order-history.html',
  styleUrl: './order-history.css'
})
export class OrderHistory implements OnInit {

  orders: OrderItem[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  private orderApiUrl = 'http://localhost:9090/api/orders';

  constructor(
    public auth: Auth,
    private http: HttpClient,
    private productService: Product,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;
    this.cdr.detectChanges();

    const customerId = this.auth.getUserId();

    if (!customerId && !this.auth.isAdmin()) {
      this.errorMessage = 'Please login to view your orders';
      this.orders = [];
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    const orderRequest = this.auth.isAdmin()
      ? this.http.get<OrderItem[]>(`${this.orderApiUrl}/all`)
      : this.http.get<OrderItem[]>(`${this.orderApiUrl}/customer/${customerId}`);

    orderRequest.pipe(
      timeout(3000),
      catchError((error) => {
        console.log('Order load fallback:', error);
        return of(this.getLocalOrders());
      })
    ).subscribe({
      next: (data) => {
        this.orders = data || [];

        if (this.orders.length === 0) {
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }

        this.loadProductDetailsForOrders();
      },
      error: (error) => {
        console.log('Order history error:', error);
        this.orders = this.getLocalOrders();

        if (this.orders.length > 0) {
          this.loadProductDetailsForOrders();
          return;
        }

        this.errorMessage = 'Unable to load orders';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadProductDetailsForOrders(): void {
    const productRequests = this.orders.map((order) => {
      const localProduct = this.getProductSnapshot(this.getOrderId(order));

      if (!order.productId) {
        return of(localProduct);
      }

      return this.productService.getProductById(order.productId).pipe(
        timeout(3000),
        catchError((error) => {
          console.log('Product details fallback:', error);
          return of(localProduct);
        })
      );
    });

    forkJoin(productRequests).subscribe({
      next: (products) => {
        this.orders = this.orders.map((order, index) => ({
          ...order,
          product: products[index]
        }));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  refreshOrders(): void {
    this.loadOrders();
  }

  goToPayment(order: OrderItem): void {
    const orderId = this.getOrderId(order);

    if (orderId) {
      this.router.navigate(['/payment', orderId]);
    }
  }

  viewInvoice(order: OrderItem): void {
    const orderId = this.getOrderId(order);

    if (orderId) {
      this.router.navigate(['/invoice', orderId]);
    }
  }

  getOrderId(order: OrderItem): number {
    return order.id || order.orderId || 0;
  }

  getProductName(order: OrderItem): string {
    return order.product?.name || 'Product #' + order.productId;
  }

  getProductCategory(order: OrderItem): string {
    return order.product?.category || 'Category not available';
  }

  getVendorName(order: OrderItem): string {
    return order.product?.vendor || 'Vendor not available';
  }

  getImageUrl(order: OrderItem): string {
    if (order.product?.imageUrl && order.product.imageUrl.trim().length > 0) {
      return order.product.imageUrl;
    }

    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
  }

  getOrderStatus(order: OrderItem): string {
    return order.orderStatus || 'CONFIRMED';
  }

  getPaymentStatus(order: OrderItem): string {
    const localStatus = this.getLocalPaymentStatus(this.getOrderId(order));
    return localStatus || order.paymentStatus || 'PENDING';
  }

  isPaid(order: OrderItem): boolean {
    const status = this.getPaymentStatus(order).toUpperCase();
    return status === 'PAID' || status === 'COD';
  }

  getStatusClass(status: string): string {
    const value = status.toUpperCase();

    if (value === 'PAID' || value === 'COD' || value === 'CONFIRMED' || value === 'COMPLETED') {
      return 'status-success';
    }

    if (value === 'PENDING') {
      return 'status-warning';
    }

    return 'status-danger';
  }

  getAddress(order: OrderItem): ShippingAddress | undefined {
    const addresses = JSON.parse(localStorage.getItem('orderAddresses') || '{}');
    return addresses[this.getOrderId(order)];
  }

  getLocalOrders(): OrderItem[] {
    const ordersMap = JSON.parse(localStorage.getItem('orderSnapshots') || '{}');
    const orders = Object.values(ordersMap) as OrderItem[];

    if (this.auth.isAdmin()) {
      return orders;
    }

    const customerId = this.auth.getUserId();
    return orders.filter((order) => order.customerId === customerId);
  }

  getProductSnapshot(orderId: number): ProductDTO | undefined {
    const snapshots = JSON.parse(localStorage.getItem('orderProductSnapshots') || '{}');
    return snapshots[orderId];
  }

  getLocalPaymentStatus(orderId: number): string {
    const paymentMap = JSON.parse(localStorage.getItem('orderPaymentStatus') || '{}');
    return paymentMap[orderId] || '';
  }
}



