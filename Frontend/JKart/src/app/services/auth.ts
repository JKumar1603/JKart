import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  adminPassword?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  message: string;
  userId: number;
  name: string;
  email: string;
  role: string;
}

export interface OtpVerifyRequest {
  email: string;
  otp: string;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private baseUrl = 'http://localhost:9090/api/auth';

  constructor(private http: HttpClient) { }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, request).pipe(timeout(8000));
  }

  sendRegistrationOtp(request: RegisterRequest): Observable<string> {
    return this.http.post(`${this.baseUrl}/send-otp`, request, { responseType: 'text' }).pipe(timeout(8000));
  }

  verifyOtpAndRegister(request: OtpVerifyRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/verify-otp`, request).pipe(timeout(8000));
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request).pipe(timeout(8000));
  }

  saveUser(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('userId', response.userId.toString());
    localStorage.setItem('name', response.name);
    localStorage.setItem('email', response.email);
    localStorage.setItem('role', response.role);
  }

  logout(): void {
    localStorage.clear();
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): number {
    return Number(localStorage.getItem('userId'));
  }

  getName(): string {
    return localStorage.getItem('name') || '';
  }

  getEmail(): string {
    return localStorage.getItem('email') || '';
  }

  getRole(): string {
    return localStorage.getItem('role') || '';
  }

  isCustomer(): boolean {
    return this.getRole() === 'CUSTOMER';
  }

  isVendor(): boolean {
    return this.getRole() === 'VENDOR';
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }
}

