import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';

export interface ProductDTO {
  id?: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  vendor: string;
  status?: string;
  category: string;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class Product {

  private baseUrl = 'http://localhost:9090/api/products';

  constructor(private http: HttpClient) { }

  addProduct(product: ProductDTO): Observable<ProductDTO> {
    return this.http.post<ProductDTO>(this.baseUrl, product).pipe(timeout(10000));
  }

  getAllProducts(): Observable<ProductDTO[]> {
    return this.http.get<ProductDTO[]>(this.baseUrl).pipe(timeout(10000));
  }

  getApprovedProducts(): Observable<ProductDTO[]> {
    return this.http.get<ProductDTO[]>(`${this.baseUrl}/approved`).pipe(timeout(10000));
  }

  getProductById(id: number): Observable<ProductDTO> {
    return this.http.get<ProductDTO>(`${this.baseUrl}/${id}`).pipe(timeout(10000));
  }

  updateProduct(id: number, product: ProductDTO): Observable<ProductDTO> {
    return this.http.put<ProductDTO>(`${this.baseUrl}/${id}`, product).pipe(timeout(10000));
  }

  approveProduct(id: number): Observable<ProductDTO> {
    return this.http.put<ProductDTO>(`${this.baseUrl}/${id}/approve`, {}).pipe(timeout(10000));
  }

  rejectProduct(id: number): Observable<ProductDTO> {
    return this.http.put<ProductDTO>(`${this.baseUrl}/${id}/reject`, {}).pipe(timeout(10000));
  }

  updateQuantity(id: number, quantity: number): Observable<ProductDTO> {
    return this.http.put<ProductDTO>(`${this.baseUrl}/${id}/quantity?quantity=${quantity}`, {}).pipe(timeout(10000));
  }

  deleteProduct(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' }).pipe(timeout(10000));
  }

  searchProducts(name: string): Observable<ProductDTO[]> {
    return this.http.get<ProductDTO[]>(`${this.baseUrl}/search?name=${encodeURIComponent(name)}`).pipe(timeout(10000));
  }

  getProductsByVendor(vendor: string): Observable<ProductDTO[]> {
    return this.http.get<ProductDTO[]>(`${this.baseUrl}/vendor/${encodeURIComponent(vendor)}`).pipe(timeout(10000));
  }
}
