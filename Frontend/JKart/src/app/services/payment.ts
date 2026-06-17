import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Order, OrderDTO } from './order';

@Injectable({
  providedIn: 'root'
})
export class Payment {

  constructor(private orderService: Order) { }

  makePayment(orderId: number): Observable<OrderDTO> {
    return this.orderService.makePayment(orderId);
  }
}