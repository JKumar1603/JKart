import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Auth } from '../services/auth';
import { Product, ProductDTO } from '../services/product';

type CartProduct = ProductDTO & {
  quantity: number;
};

@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductList implements OnInit {

  products: ProductDTO[] = [];
  filteredProducts: ProductDTO[] = [];

  categories: string[] = [
    'All', 'Electronics', 'Mobiles', 'Gaming', 'Fashion', 'Footwear', 'Beauty',
    'Home Appliances', 'Furniture', 'Kitchen', 'Books', 'Sports', 'Accessories'
  ];

  sortOptions = [
    { label: 'Default', value: 'default' },
    { label: 'Price: Low to High', value: 'priceLowHigh' },
    { label: 'Price: High to Low', value: 'priceHighLow' },
    { label: 'Name: A to Z', value: 'nameAZ' },
    { label: 'Name: Z to A', value: 'nameZA' },
    { label: 'Stock: High to Low', value: 'quantityHighLow' }
  ];

  newProduct: ProductDTO = {
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    vendor: '',
    status: 'PENDING',
    category: 'Electronics',
    imageUrl: ''
  };

  searchText = '';
  selectedCategory = 'All';
  selectedSort = 'default';
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  showAddProductForm = false;

  constructor(
    public auth: Auth,
    private productService: Product,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const category = params['category'];
      const search = params['search'];

      this.selectedCategory = category && this.categories.includes(category) ? category : 'All';
      this.searchText = search ? search : '';
      this.applyFilters();
      this.cdr.detectChanges();
    });

    this.loadProducts();
  }

  loadProducts(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    if (this.auth.isAdmin()) {
      this.productService.getAllProducts().subscribe({
        next: (data) => this.handleProducts(data),
        error: (error) => this.handleProductError(error, 'Unable to load products')
      });
      return;
    }

    if (this.auth.isVendor()) {
      this.productService.getProductsByVendor(this.auth.getName()).subscribe({
        next: (data) => this.handleProducts(data),
        error: (error) => this.handleProductError(error, 'Unable to load vendor products')
      });
      return;
    }

    this.productService.getApprovedProducts().subscribe({
      next: (data) => this.handleProducts(data),
      error: (error) => this.handleProductError(error, 'Unable to load approved products')
    });
  }

  handleProducts(data: ProductDTO[]): void {
    this.products = data;
    this.applyFilters();
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  handleProductError(error: any, message: string): void {
    console.log('Products error:', error);
    this.errorMessage = message;
    this.products = [];
    this.filteredProducts = [];
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  addProduct(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.newProduct.name || !this.newProduct.description || this.newProduct.price <= 0 || this.newProduct.quantity <= 0 || !this.newProduct.category) {
      this.errorMessage = 'Please enter valid product details';
      return;
    }

    this.newProduct.vendor = this.auth.getName();
    this.newProduct.status = 'PENDING';

    this.productService.addProduct(this.newProduct).subscribe({
      next: () => {
        this.successMessage = 'Product added successfully and sent for admin approval';
        this.resetForm();
        this.loadProducts();
      },
      error: (error) => {
        console.log('Add product error:', error);
        this.errorMessage = 'Unable to add product';
        this.cdr.detectChanges();
      }
    });
  }

  approveProduct(id: number | undefined): void {
    if (!id) {
      return;
    }

    this.productService.approveProduct(id).subscribe({
      next: () => {
        this.successMessage = 'Product approved successfully';
        this.loadProducts();
      },
      error: (error) => {
        console.log('Approve product error:', error);
        this.errorMessage = 'Unable to approve product';
        this.cdr.detectChanges();
      }
    });
  }

  rejectProduct(id: number | undefined): void {
    if (!id) {
      return;
    }

    this.productService.rejectProduct(id).subscribe({
      next: () => {
        this.successMessage = 'Product rejected successfully';
        this.loadProducts();
      },
      error: (error) => {
        console.log('Reject product error:', error);
        this.errorMessage = 'Unable to reject product';
        this.cdr.detectChanges();
      }
    });
  }

  deleteProduct(id: number | undefined): void {
    if (!id || !confirm('Are you sure you want to delete this product?')) {
      return;
    }

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.successMessage = 'Product deleted successfully';
        this.loadProducts();
      },
      error: (error) => {
        console.log('Delete product error:', error);
        this.errorMessage = 'Unable to delete product';
        this.cdr.detectChanges();
      }
    });
  }

  viewProduct(product: ProductDTO): void {
    this.saveRecentlyViewed(product);

    if (product.id) {
      this.router.navigate(['/products', product.id]);
    }
  }

  addToCart(product: ProductDTO): void {
    if (!this.auth.isCustomer()) {
      this.errorMessage = 'Please login as customer to add products to cart';
      this.successMessage = '';
      return;
    }

    if (!this.canAddToCart(product)) {
      this.errorMessage = 'This product is currently out of stock';
      this.successMessage = '';
      return;
    }

    const cartItems: CartProduct[] = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const existingItem = cartItems.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity = existingItem.quantity + 1;
    } else {
      cartItems.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    this.successMessage = 'Product added to cart';
    this.errorMessage = '';
  }

  addToWishlist(product: ProductDTO): void {
    if (!this.auth.isLoggedIn() || !this.auth.isCustomer()) {
      this.errorMessage = 'Please login as customer to add products to wishlist';
      this.successMessage = '';
      return;
    }

    const wishlistItems: ProductDTO[] = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
    const exists = wishlistItems.some((item) => item.id === product.id);

    if (!exists) {
      wishlistItems.push(product);
      localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
      this.successMessage = 'Product added to wishlist';
    } else {
      this.successMessage = 'Product already exists in wishlist';
    }

    this.errorMessage = '';
  }

  isWishlisted(product: ProductDTO): boolean {
    const wishlistItems: ProductDTO[] = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
    return wishlistItems.some((item) => item.id === product.id);
  }

  saveRecentlyViewed(product: ProductDTO): void {
    const recentItems: ProductDTO[] = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const updatedItems = recentItems.filter((item) => item.id !== product.id);
    updatedItems.unshift(product);
    localStorage.setItem('recentlyViewed', JSON.stringify(updatedItems.slice(0, 4)));
  }

  searchProducts(): void {
    this.applyFilters();
  }

  filterByCategory(): void {
    this.applyFilters();
  }

  sortProducts(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedCategory = 'All';
    this.selectedSort = 'default';
    this.applyFilters();
  }

  applyFilters(): void {
    const searchValue = this.searchText.trim().toLowerCase();
    const selected = this.selectedCategory.trim().toLowerCase();

    let result = this.products.filter((product) => {
      const name = product.name ? product.name.trim().toLowerCase() : '';
      const description = product.description ? product.description.trim().toLowerCase() : '';
      const vendor = product.vendor ? product.vendor.trim().toLowerCase() : '';
      const category = product.category ? product.category.trim().toLowerCase() : '';
      const price = product.price ? product.price.toString() : '';

      const matchesSearch = !searchValue || name.includes(searchValue) || description.includes(searchValue) || vendor.includes(searchValue) || category.includes(searchValue) || price.includes(searchValue);
      const matchesCategory = selected === 'all' || category === selected;

      return matchesSearch && matchesCategory;
    });

    this.filteredProducts = this.sortProductList(result);
  }

  sortProductList(productList: ProductDTO[]): ProductDTO[] {
    const sortedProducts = [...productList];

    if (this.selectedSort === 'priceLowHigh') {
      return sortedProducts.sort((a, b) => a.price - b.price);
    }

    if (this.selectedSort === 'priceHighLow') {
      return sortedProducts.sort((a, b) => b.price - a.price);
    }

    if (this.selectedSort === 'nameAZ') {
      return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (this.selectedSort === 'nameZA') {
      return sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
    }

    if (this.selectedSort === 'quantityHighLow') {
      return sortedProducts.sort((a, b) => b.quantity - a.quantity);
    }

    return sortedProducts;
  }

  resetForm(): void {
    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      quantity: 0,
      vendor: '',
      status: 'PENDING',
      category: 'Electronics',
      imageUrl: ''
    };

    this.showAddProductForm = false;
  }

  getStatusClass(status: string | undefined): string {
    if (status === 'APPROVED') {
      return 'badge-approved';
    }

    if (status === 'REJECTED') {
      return 'badge-rejected';
    }

    return 'badge-pending';
  }

  getStockLabel(product: ProductDTO): string {
    return product.quantity > 0 ? 'In Stock' : 'Out of Stock';
  }

  getStockClass(product: ProductDTO): string {
    return product.quantity > 0 ? 'badge-in-stock' : 'badge-out-stock';
  }

  canAddToCart(product: ProductDTO): boolean {
    return product.status === 'APPROVED' && product.quantity > 0;
  }

  getImageUrl(product: ProductDTO): string {
    if (product.imageUrl && product.imageUrl.trim().length > 0) {
      return product.imageUrl;
    }

    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
  }
}


