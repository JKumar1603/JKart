import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

import { Navbar } from './navbar/navbar';
import { Footer } from './footer/footer';
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

@NgModule({
  declarations: [
    App,
    Navbar,
    Footer,
    Home,
    Login,
    Register,
    ProductList,
    ProductDetails,
    Cart,
    OrderHistory,
    Payment,
    Invoice,
    AdminDashboard,
    Profile,
    Wishlist
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient()
  ],
  bootstrap: [
    App
  ]
})
export class AppModule { }


