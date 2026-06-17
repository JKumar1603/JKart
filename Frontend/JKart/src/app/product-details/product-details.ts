import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Auth } from '../services/auth';
import { Product, ProductDTO } from '../services/product';

type CartProduct = ProductDTO & {
  quantity: number;
};

@Component({
  selector: 'app-product-details',
  standalone: false,
  templateUrl: './product-details.html',
  styleUrl: './product-details.css'
})
export class ProductDetails implements OnInit {

  product?: ProductDTO;
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    public auth: Auth,
    private productService: Product,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const productId = Number(this.route.snapshot.paramMap.get('id'));

    if (!productId) {
      this.errorMessage = 'Invalid product selected';
      return;
    }

    this.loadProduct(productId);
  }

  loadProduct(productId: number): void {
    this.isLoading = true;

    this.productService.getProductById(productId).subscribe({
      next: (data) => {
        this.product = data;
        this.saveRecentlyViewed(data);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log('Product details error:', error);
        this.errorMessage = 'Unable to load product details';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  addToCart(): void {
    if (!this.product) {
      return;
    }

    if (!this.auth.isCustomer()) {
      this.errorMessage = 'Please login as customer to add product to cart';
      this.successMessage = '';
      return;
    }

    if (this.product.quantity <= 0 || this.product.status !== 'APPROVED') {
      this.errorMessage = 'This product is currently out of stock';
      this.successMessage = '';
      return;
    }

    const cartItems: CartProduct[] = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const existingItem = cartItems.find((item) => item.id === this.product?.id);

    if (existingItem) {
      existingItem.quantity = existingItem.quantity + 1;
    } else {
      cartItems.push({ ...this.product, quantity: 1 });
    }

    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    this.successMessage = 'Product added to cart';
    this.errorMessage = '';
  }

  addToWishlist(): void {
    if (!this.product) {
      return;
    }

    if (!this.auth.isLoggedIn() || !this.auth.isCustomer()) {
      this.errorMessage = 'Please login as customer to add product to wishlist';
      this.successMessage = '';
      return;
    }

    const wishlistItems: ProductDTO[] = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
    const exists = wishlistItems.some((item) => item.id === this.product?.id);

    if (!exists) {
      wishlistItems.push(this.product);
      localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
      this.successMessage = 'Product added to wishlist';
    } else {
      this.successMessage = 'Product already exists in wishlist';
    }

    this.errorMessage = '';
  }

  saveRecentlyViewed(product: ProductDTO): void {
    const recentItems: ProductDTO[] = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const updatedItems = recentItems.filter((item) => item.id !== product.id);
    updatedItems.unshift(product);
    localStorage.setItem('recentlyViewed', JSON.stringify(updatedItems.slice(0, 4)));
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  getStatusLabel(): string {
    if (!this.product) {
      return '';
    }

    if (this.auth.isAdmin() || this.auth.isVendor()) {
      return this.product.status || 'PENDING';
    }

    return this.product.quantity > 0 ? 'In Stock' : 'Out of Stock';
  }

  getStatusClass(): string {
    if (!this.product) {
      return '';
    }

    if (this.auth.isAdmin() || this.auth.isVendor()) {
      if (this.product.status === 'APPROVED') {
        return 'badge-approved';
      }

      if (this.product.status === 'REJECTED') {
        return 'badge-rejected';
      }

      return 'badge-pending';
    }

    return this.product.quantity > 0 ? 'badge-in-stock' : 'badge-out-stock';
  }

  getImageUrl(): string {
    if (this.product && this.product.imageUrl && this.product.imageUrl.trim().length > 0) {
      return this.product.imageUrl;
    }

    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80';
  }
}

