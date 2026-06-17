import { Component, OnInit } from '@angular/core';

interface RecentlyViewedProduct {
  id?: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  vendor: string;
  status: string;
  category: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  recentlyViewed: RecentlyViewedProduct[] = [];

  dealProducts = [
    {
      name: 'Gaming Laptop',
      category: 'Electronics',
      offer: 'Up to 20% off',
      imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Wireless Headphones',
      category: 'Electronics',
      offer: 'Best seller',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Running Shoes',
      category: 'Footwear',
      offer: 'Flat 15% off',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Coffee Maker',
      category: 'Home Appliances',
      offer: 'Hot deal',
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80'
    }
  ];

  shoppingHighlights = [
    {
      title: 'Verified Products',
      text: 'Only admin-approved products are shown to customers.',
      icon: '✅'
    },
    {
      title: 'Secure Checkout',
      text: 'Simple order, payment and invoice flow for customers.',
      icon: '💳'
    },
    {
      title: 'Vendor Marketplace',
      text: 'Vendors can add products and manage their catalog.',
      icon: '🏪'
    },
    {
      title: 'Fast Product Search',
      text: 'Search and category filtering make product discovery easy.',
      icon: '🔎'
    }
  ];

  ngOnInit(): void {
    this.recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
  }

  getImageUrl(product: RecentlyViewedProduct): string {
    if (product.imageUrl && product.imageUrl.trim().length > 0) {
      return product.imageUrl;
    }

    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
  }
}

