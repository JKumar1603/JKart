import { Component, OnInit } from '@angular/core';

import { ProductDTO } from '../services/product';

type CartProduct = ProductDTO & {
  quantity: number;
};

@Component({
  selector: 'app-wishlist',
  standalone: false,
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css'
})
export class Wishlist implements OnInit {

  wishlistItems: ProductDTO[] = [];
  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.wishlistItems = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
  }

  removeFromWishlist(productId: number | undefined): void {
    if (!productId) {
      return;
    }

    this.wishlistItems = this.wishlistItems.filter((product) => product.id !== productId);
    localStorage.setItem('wishlistItems', JSON.stringify(this.wishlistItems));
    this.successMessage = 'Product removed from wishlist';
    this.errorMessage = '';
  }

  moveToCart(product: ProductDTO): void {
    if (product.quantity <= 0) {
      this.errorMessage = 'This product is currently out of stock';
      this.successMessage = '';
      return;
    }

    const cartItems: CartProduct[] = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const existingItem = cartItems.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity = existingItem.quantity + 1;
    } else {
      cartItems.push({
        ...product,
        quantity: 1
      });
    }

    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    this.removeFromWishlist(product.id);
    this.successMessage = 'Product moved to cart';
    this.errorMessage = '';
  }

  clearWishlist(): void {
    localStorage.removeItem('wishlistItems');
    this.wishlistItems = [];
    this.successMessage = 'Wishlist cleared successfully';
    this.errorMessage = '';
  }

  getImageUrl(product: ProductDTO): string {
    if (product.imageUrl && product.imageUrl.trim().length > 0) {
      return product.imageUrl;
    }

    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
  }
}
