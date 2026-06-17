import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

import { Auth } from '../services/auth';
import { ProductDTO } from '../services/product';

type CartProduct = ProductDTO & {
  quantity: number;
};

interface ShippingAddress {
  fullName: string;
  mobile: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

interface OrderResponse {
  id?: number;
  orderId?: number;
  productId: number;
  customerId: number;
  quantity: number;
  totalAmount: number;
  orderStatus?: string;
  paymentStatus?: string;
}

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit {

  cartItems: CartProduct[] = [];
  address: ShippingAddress = {
    fullName: '',
    mobile: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: ''
  };

  errorMessage = '';
  successMessage = '';
  isPlacingOrder = false;

  private orderApiUrl = 'http://localhost:9090/api/orders';

  constructor(
    public auth: Auth,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCart();
    this.loadSavedAddress();
  }

  loadCart(): void {
    this.cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
  }

  loadSavedAddress(): void {
    this.address.fullName = localStorage.getItem('name') || this.auth.getName();
    this.address.mobile = localStorage.getItem('mobile') || '';
    this.address.addressLine = localStorage.getItem('address') || '';
    this.address.city = localStorage.getItem('city') || '';
    this.address.state = localStorage.getItem('state') || 'Karnataka';
    this.address.pincode = localStorage.getItem('pincode') || '';
  }

  increaseQuantity(item: CartProduct): void {
    if (item.quantity < item.quantity + 1) {
      item.quantity = item.quantity + 1;
      this.saveCart();
    }
  }

  decreaseQuantity(item: CartProduct): void {
    if (item.quantity > 1) {
      item.quantity = item.quantity - 1;
      this.saveCart();
    }
  }

  removeItem(productId: number | undefined): void {
    if (!productId) {
      return;
    }

    this.cartItems = this.cartItems.filter((item) => item.id !== productId);
    this.saveCart();
  }

  clearCart(): void {
    localStorage.removeItem('cartItems');
    this.cartItems = [];
  }

  saveCart(): void {
    localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
  }

  getTotalAmount(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getImageUrl(item: CartProduct): string {
    if (item.imageUrl && item.imageUrl.trim().length > 0) {
      return item.imageUrl;
    }

    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
  }

  isAddressValid(): boolean {
    return !!this.address.fullName.trim()
      && /^[0-9]{10}$/.test(this.address.mobile.trim())
      && !!this.address.addressLine.trim()
      && !!this.address.city.trim()
      && !!this.address.state.trim()
      && /^[0-9]{6}$/.test(this.address.pincode.trim());
  }

  checkout(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.auth.isLoggedIn() || !this.auth.isCustomer()) {
      this.errorMessage = 'Please login as customer to place order';
      return;
    }

    if (this.cartItems.length === 0) {
      this.errorMessage = 'Your cart is empty';
      return;
    }

    if (!this.isAddressValid()) {
      this.errorMessage = 'Please enter a valid delivery address and 10 digit mobile number';
      return;
    }

    this.isPlacingOrder = true;
    this.saveAddressToLocalStorage();
    this.placeOrdersSequentially(0, []);
  }

  placeOrdersSequentially(index: number, createdOrders: OrderResponse[]): void {
    if (index >= this.cartItems.length) {
      this.afterOrdersCreated(createdOrders);
      return;
    }

    const item = this.cartItems[index];
    const orderRequest = {
      productId: item.id,
      customerId: this.auth.getUserId(),
      quantity: item.quantity,
      totalAmount: item.price * item.quantity,
      orderStatus: 'CONFIRMED',
      paymentStatus: 'PENDING'
    };

    this.createOrder(orderRequest).subscribe({
      next: (order) => {
        const createdOrder = order || {
          ...orderRequest,
          id: 0
        };

        this.saveOrderProductSnapshot(createdOrder, item);
        this.saveOrderAddress(createdOrder);
        createdOrders.push(createdOrder);
        this.placeOrdersSequentially(index + 1, createdOrders);
      },
      error: (error) => {
        console.log('Place order error:', error);
        this.errorMessage = 'Unable to place order';
        this.isPlacingOrder = false;
      }
    });
  }

  createOrder(orderRequest: any): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.orderApiUrl}/place`, orderRequest).pipe(
      catchError(() => this.http.post<OrderResponse>(`${this.orderApiUrl}/create`, orderRequest)),
      catchError(() => this.http.post<OrderResponse>(this.orderApiUrl, orderRequest)),
      catchError((error) => throwError(() => error))
    );
  }

  afterOrdersCreated(createdOrders: OrderResponse[]): void {
    this.isPlacingOrder = false;

    if (createdOrders.length === 0) {
      this.errorMessage = 'Unable to create order';
      return;
    }

    const firstOrderId = this.getOrderId(createdOrders[0]);
    localStorage.removeItem('cartItems');
    this.cartItems = [];

    if (firstOrderId) {
      this.router.navigate(['/payment', firstOrderId]);
      return;
    }

    this.router.navigate(['/orders']);
  }

  getOrderId(order: OrderResponse): number {
    return order.id || order.orderId || 0;
  }

  saveAddressToLocalStorage(): void {
    localStorage.setItem('name', this.address.fullName.trim());
    localStorage.setItem('mobile', this.address.mobile.trim());
    localStorage.setItem('address', this.address.addressLine.trim());
    localStorage.setItem('city', this.address.city.trim());
    localStorage.setItem('state', this.address.state.trim());
    localStorage.setItem('pincode', this.address.pincode.trim());
  }

  saveOrderAddress(order: OrderResponse): void {
    const orderId = this.getOrderId(order);

    if (!orderId) {
      return;
    }

    const addresses = JSON.parse(localStorage.getItem('orderAddresses') || '{}');
    addresses[orderId] = this.address;
    localStorage.setItem('orderAddresses', JSON.stringify(addresses));
  }

  saveOrderProductSnapshot(order: OrderResponse, product: CartProduct): void {
    const orderId = this.getOrderId(order);

    if (!orderId) {
      return;
    }

    const snapshots = JSON.parse(localStorage.getItem('orderProductSnapshots') || '{}');
    snapshots[orderId] = product;
    localStorage.setItem('orderProductSnapshots', JSON.stringify(snapshots));
  }
}

