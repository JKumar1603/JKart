import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';

export interface OrderDTO {
  id?: number;
  customerId: number;
  customerEmail?: string;
  productId: number;
  quantity: number;
  totalAmount?: number;
  orderStatus?: string;
  paymentStatus?: string;
}

@Injectable({
  providedIn: 'root'
})
export class Order {

  private baseUrl = 'http://localhost:9090/api/orders';

  constructor(private http: HttpClient) { }

  placeOrder(order: OrderDTO): Observable<OrderDTO> {
    return this.http.post<OrderDTO>(this.baseUrl, order).pipe(timeout(10000));
  }

  getAllOrders(): Observable<OrderDTO[]> {
    return this.http.get<OrderDTO[]>(this.baseUrl).pipe(timeout(10000));
  }

  getOrderById(id: number): Observable<OrderDTO> {
    return this.http.get<OrderDTO>(`${this.baseUrl}/${id}`).pipe(timeout(10000));
  }

  getOrdersByCustomerId(customerId: number): Observable<OrderDTO[]> {
    return this.http.get<OrderDTO[]>(`${this.baseUrl}/customer/${customerId}`).pipe(timeout(10000));
  }

  makePayment(id: number): Observable<OrderDTO> {
    return this.http.put<OrderDTO>(`${this.baseUrl}/${id}/pay`, {}).pipe(timeout(10000));
  }

  cancelOrder(id: number): Observable<OrderDTO> {
    return this.http.put<OrderDTO>(`${this.baseUrl}/${id}/cancel`, {}).pipe(timeout(10000));
  }

  deleteOrder(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' }).pipe(timeout(10000));
  }
}
