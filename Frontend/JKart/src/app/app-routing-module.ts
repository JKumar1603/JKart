import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Home } from './home/home';
import { Login } from './login/login';
import { Register } from './register/register';
import { ProductList } from './product-list/product-list';
import { ProductDetails } from './product-details/product-details';
import { Cart } from './cart/cart';
import { OrderHistory } from './order-history/order-history';
import { Payment } from './payment/payment';
import { Invoice } from './invoice/invoice';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { Profile } from './profile/profile';
import { Wishlist } from './wishlist/wishlist';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'products', component: ProductList },
  { path: 'products/:id', component: ProductDetails },
  { path: 'cart', component: Cart },
  { path: 'wishlist', component: Wishlist },
  { path: 'orders', component: OrderHistory },
  { path: 'payment/:orderId', component: Payment },
  { path: 'invoice/:orderId', component: Invoice },
  { path: 'admin-dashboard', component: AdminDashboard },
  { path: 'profile', component: Profile },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

