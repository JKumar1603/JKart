import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

import { Auth } from '../services/auth';
import { ProductDTO } from '../services/product';

interface PaymentOrder {
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
  selector: 'app-payment',
  standalone: false,
  templateUrl: './payment.html',
  styleUrl: './payment.css'
})
export class Payment implements OnInit {

  order?: PaymentOrder;
  product?: ProductDTO;
  address?: ShippingAddress;

  paymentMethod = 'COD';
  upiId = '';
  cardNumber = '';
  cardName = '';
  cardExpiry = '';
  cardCvv = '';

  isLoading = false;
  isProcessing = false;
  orderSuccess = false;
  errorMessage = '';
  successMessage = '';

  private orderApiUrl = 'http://localhost:9090/api/orders';
  private notificationApiUrl = 'http://localhost:9090/api/notifications';

  constructor(
    public auth: Auth,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const orderId = Number(this.route.snapshot.paramMap.get('orderId'));

    if (!orderId) {
      this.errorMessage = 'Invalid order selected';
      return;
    }

    this.loadPaymentDetails(orderId);
  }

  loadPaymentDetails(orderId: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.product = this.getProductSnapshot(orderId);
    this.address = this.getOrderAddress(orderId);

    const localOrder = this.getOrderSnapshot(orderId);

    if (localOrder) {
      this.order = localOrder;
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.http.get<PaymentOrder>(`${this.orderApiUrl}/${orderId}`).pipe(
      timeout(3000),
      catchError((error) => {
        console.log('Payment order load fallback:', error);
        return of(this.buildFallbackOrder(orderId));
      })
    ).subscribe({
      next: (data) => {
        if (!data) {
          this.errorMessage = 'Unable to load payment details';
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }

        this.order = data;
        this.saveOrderSnapshot(data);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Unable to load payment details';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  buildFallbackOrder(orderId: number): PaymentOrder | undefined {
    if (!this.product) {
      return undefined;
    }

    return {
      id: orderId,
      productId: this.product.id || 0,
      customerId: this.auth.getUserId(),
      quantity: 1,
      totalAmount: this.product.price,
      orderStatus: 'CONFIRMED',
      paymentStatus: 'PENDING'
    };
  }

  completePayment(): void {
    if (!this.order) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.validatePaymentDetails()) {
      return;
    }

    this.isProcessing = true;
    this.cdr.detectChanges();

    const paymentStatus = this.paymentMethod === 'COD' ? 'COD' : 'PAID';
    const orderId = this.getOrderId();

    this.updatePaymentStatus(orderId, paymentStatus).subscribe({
      next: () => {
        this.finishPayment(paymentStatus);
      },
      error: (error) => {
        console.log('Payment update fallback:', error);
        this.finishPayment(paymentStatus);
      }
    });
  }

  validatePaymentDetails(): boolean {
    if (this.paymentMethod === 'UPI') {
      const upiPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;

      if (!upiPattern.test(this.upiId.trim())) {
        this.errorMessage = 'Please enter a valid UPI ID';
        return false;
      }
    }

    if (this.paymentMethod === 'CARD') {
      const cardNumber = this.cardNumber.replace(/\s/g, '');

      if (!/^[0-9]{12,19}$/.test(cardNumber)) {
        this.errorMessage = 'Please enter a valid card number';
        return false;
      }

      if (!this.cardName.trim()) {
        this.errorMessage = 'Please enter the name on card';
        return false;
      }

      if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(this.cardExpiry.trim())) {
        this.errorMessage = 'Please enter expiry in MM/YY format';
        return false;
      }

      if (!/^[0-9]{3,4}$/.test(this.cardCvv.trim())) {
        this.errorMessage = 'Please enter a valid CVV';
        return false;
      }
    }

    return true;
  }

  finishPayment(paymentStatus: string): void {
    if (!this.order) {
      return;
    }

    const orderId = this.getOrderId();
    this.order.paymentStatus = paymentStatus;
    this.saveLocalPaymentStatus(orderId, paymentStatus);
    this.saveOrderSnapshot(this.order);
    this.sendNotification(orderId, paymentStatus);

    this.orderSuccess = true;
    this.isProcessing = false;
    this.successMessage = paymentStatus === 'COD'
      ? 'Order placed successfully with Cash on Delivery'
      : 'Payment completed and order placed successfully';
    this.cdr.detectChanges();
  }

  updatePaymentStatus(orderId: number, paymentStatus: string) {
    const body = {
      paymentStatus: paymentStatus,
      paymentMethod: this.paymentMethod
    };

    return this.http.put(`${this.orderApiUrl}/payment/${orderId}?paymentStatus=${paymentStatus}`, {}).pipe(
      timeout(3000),
      catchError(() => this.http.put(`${this.orderApiUrl}/${orderId}/payment`, body).pipe(timeout(3000))),
      catchError(() => this.http.post(`${this.orderApiUrl}/pay/${orderId}`, body).pipe(timeout(3000))),
      catchError((error) => throwError(() => error))
    );
  }

  sendNotification(orderId: number, paymentStatus: string): void {
    const email = this.auth.getEmail();

    if (!email) {
      return;
    }

    this.http.get(`${this.notificationApiUrl}/order?email=${encodeURIComponent(email)}&orderId=${orderId}`).pipe(
      timeout(3000),
      catchError(() => of(null))
    ).subscribe();

    if (paymentStatus === 'PAID') {
      this.http.get(`${this.notificationApiUrl}/payment?email=${encodeURIComponent(email)}&orderId=${orderId}`).pipe(
        timeout(3000),
        catchError(() => of(null))
      ).subscribe();
    }
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }

  goToProducts(): void {
    this.router.navigate(['/products']);
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

  getImageUrl(): string {
    if (this.product?.imageUrl && this.product.imageUrl.trim().length > 0) {
      return this.product.imageUrl;
    }

    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
  }

  getProductSnapshot(orderId: number): ProductDTO | undefined {
    const snapshots = JSON.parse(localStorage.getItem('orderProductSnapshots') || '{}');
    return snapshots[orderId];
  }

  getOrderAddress(orderId: number): ShippingAddress | undefined {
    const addresses = JSON.parse(localStorage.getItem('orderAddresses') || '{}');
    return addresses[orderId];
  }

  getOrderSnapshot(orderId: number): PaymentOrder | undefined {
    const orders = JSON.parse(localStorage.getItem('orderSnapshots') || '{}');
    return orders[orderId];
  }

  saveOrderSnapshot(order: PaymentOrder): void {
    const orderId = order.id || order.orderId || 0;

    if (!orderId) {
      return;
    }

    const orders = JSON.parse(localStorage.getItem('orderSnapshots') || '{}');
    orders[orderId] = order;
    localStorage.setItem('orderSnapshots', JSON.stringify(orders));
  }

  saveLocalPaymentStatus(orderId: number, paymentStatus: string): void {
    const paymentMap = JSON.parse(localStorage.getItem('orderPaymentStatus') || '{}');
    paymentMap[orderId] = paymentStatus;
    localStorage.setItem('orderPaymentStatus', JSON.stringify(paymentMap));
  }
}

