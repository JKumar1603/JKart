import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ProductDTO } from '../services/product';

interface OrderDTO {
  id?: number;
  customerId: number;
  customerEmail?: string;
  productId: number;
  quantity: number;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
}

interface UserStats {
  totalUsers: number;
  totalCustomers: number;
  totalVendors: number;
  totalAdmins: number;
}

interface CategoryCount {
  category: string;
  count: number;
  percentage: number;
}

interface ProductSales {
  productId: number;
  name: string;
  sold: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {

  products: ProductDTO[] = [];
  orders: OrderDTO[] = [];

  userStats: UserStats = {
    totalUsers: 0,
    totalCustomers: 0,
    totalVendors: 0,
    totalAdmins: 0
  };

  totalProducts = 0;
  approvedProducts = 0;
  pendingProducts = 0;
  rejectedProducts = 0;
  totalOrders = 0;
  paidOrders = 0;
  pendingPayments = 0;
  cancelledOrders = 0;
  totalRevenue = 0;
  estimatedProfit = 0;
  totalItemsSold = 0;
  totalStockLeft = 0;
  lowStockProducts = 0;
  outOfStockProducts = 0;

  categoryCounts: CategoryCount[] = [];
  topSellingProducts: ProductSales[] = [];

  isLoading = false;
  errorMessage = '';
  userStatsNote = '';

  private baseUrl = 'http://localhost:9090/api';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.userStatsNote = '';

    this.loadUserStats();
    this.loadProducts();
    this.loadOrders();
  }

  loadUserStats(): void {
    this.http.get<UserStats>(`${this.baseUrl}/auth/stats`).subscribe({
      next: (data) => {
        this.userStats = data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.userStatsNote = 'User count needs Auth Service stats API.';
        this.cdr.detectChanges();
      }
    });
  }

  loadProducts(): void {
    this.http.get<ProductDTO[]>(`${this.baseUrl}/products`).subscribe({
      next: (data) => {
        this.products = data;
        this.calculateProductStats();
        this.checkLoadingCompleted();
      },
      error: (error) => {
        console.log('Product dashboard error:', error);
        this.errorMessage = 'Unable to load product analytics';
        this.products = [];
        this.calculateProductStats();
        this.checkLoadingCompleted();
      }
    });
  }

  loadOrders(): void {
    this.http.get<OrderDTO[]>(`${this.baseUrl}/orders`).subscribe({
      next: (data) => {
        this.orders = data;
        this.calculateOrderStats();
        this.checkLoadingCompleted();
      },
      error: (error) => {
        console.log('Order dashboard error:', error);
        this.errorMessage = 'Unable to load order analytics';
        this.orders = [];
        this.calculateOrderStats();
        this.checkLoadingCompleted();
      }
    });
  }

  calculateProductStats(): void {
    this.totalProducts = this.products.length;
    this.approvedProducts = this.products.filter((product) => product.status === 'APPROVED').length;
    this.pendingProducts = this.products.filter((product) => product.status === 'PENDING').length;
    this.rejectedProducts = this.products.filter((product) => product.status === 'REJECTED').length;
    this.totalStockLeft = this.products.reduce((total, product) => total + product.quantity, 0);
    this.lowStockProducts = this.products.filter((product) => product.quantity > 0 && product.quantity <= 5).length;
    this.outOfStockProducts = this.products.filter((product) => product.quantity === 0).length;
    this.categoryCounts = this.getCategoryCounts();
  }

  calculateOrderStats(): void {
    this.totalOrders = this.orders.length;
    this.paidOrders = this.orders.filter((order) => order.paymentStatus === 'PAID').length;
    this.pendingPayments = this.orders.filter((order) => order.paymentStatus === 'PENDING').length;
    this.cancelledOrders = this.orders.filter((order) => order.orderStatus === 'CANCELLED').length;
    this.totalRevenue = this.orders
      .filter((order) => order.paymentStatus === 'PAID')
      .reduce((total, order) => total + Number(order.totalAmount || 0), 0);
    this.estimatedProfit = Math.round(this.totalRevenue * 0.10);
    this.totalItemsSold = this.orders
      .filter((order) => order.paymentStatus === 'PAID')
      .reduce((total, order) => total + Number(order.quantity || 0), 0);
    this.topSellingProducts = this.getTopSellingProducts();
  }

  getCategoryCounts(): CategoryCount[] {
    const categoryMap = new Map<string, number>();

    this.products.forEach((product) => {
      const category = product.category || 'Others';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    return Array.from(categoryMap.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: this.totalProducts > 0 ? Math.round((count / this.totalProducts) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
  }

  getTopSellingProducts(): ProductSales[] {
    const salesMap = new Map<number, number>();

    this.orders
      .filter((order) => order.paymentStatus === 'PAID')
      .forEach((order) => {
        salesMap.set(order.productId, (salesMap.get(order.productId) || 0) + Number(order.quantity || 0));
      });

    return Array.from(salesMap.entries())
      .map(([productId, sold]) => ({
        productId,
        sold,
        name: this.getProductName(productId)
      }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  }

  getProductName(productId: number): string {
    const product = this.products.find((item) => item.id === productId);
    return product ? product.name : `Product ${productId}`;
  }

  getStatusPercentage(value: number): number {
    if (this.totalProducts === 0) {
      return 0;
    }

    return Math.round((value / this.totalProducts) * 100);
  }

  getOrderPercentage(value: number): number {
    if (this.totalOrders === 0) {
      return 0;
    }

    return Math.round((value / this.totalOrders) * 100);
  }

  getMaxCategoryCount(): number {
    if (this.categoryCounts.length === 0) {
      return 1;
    }

    return Math.max(...this.categoryCounts.map((item) => item.count));
  }

  getMaxSoldCount(): number {
    if (this.topSellingProducts.length === 0) {
      return 1;
    }

    return Math.max(...this.topSellingProducts.map((item) => item.sold));
  }

  checkLoadingCompleted(): void {
    this.isLoading = false;
    this.cdr.detectChanges();
  }
}
