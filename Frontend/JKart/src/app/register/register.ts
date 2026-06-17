import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';

import { Auth, RegisterRequest } from '../services/auth';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  registerData: RegisterRequest = {
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER',
    adminPassword: ''
  };

  otp = '';
  otpSent = false;
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private auth: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  sendOtp(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.registerData.name || !this.registerData.email || !this.registerData.password || !this.registerData.role) {
      this.errorMessage = 'Please enter valid registration details';
      return;
    }

    if (this.registerData.role === 'ADMIN' && !this.registerData.adminPassword) {
      this.errorMessage = 'Main admin password is required for admin registration';
      return;
    }

    if (this.registerData.role !== 'ADMIN') {
      this.registerData.adminPassword = '';
    }

    this.isLoading = true;

    this.auth.sendRegistrationOtp(this.registerData).subscribe({
      next: (response) => {
        this.successMessage = response;
        this.otpSent = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log('Send OTP error:', error);
        this.errorMessage = this.getErrorMessage(error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  verifyOtpAndRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.otp) {
      this.errorMessage = 'Please enter OTP';
      return;
    }

    this.isLoading = true;

    this.auth.verifyOtpAndRegister({
      email: this.registerData.email,
      otp: this.otp
    }).subscribe({
      next: () => {
        this.successMessage = 'Registration successful. Please login.';
        this.isLoading = false;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 800);
      },
      error: (error) => {
        console.log('Verify OTP error:', error);
        this.errorMessage = this.getErrorMessage(error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  editDetails(): void {
    this.otpSent = false;
    this.otp = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  roleChanged(): void {
    this.errorMessage = '';

    if (this.registerData.role !== 'ADMIN') {
      this.registerData.adminPassword = '';
    }
  }

  private getErrorMessage(error: any): string {
    if (typeof error.error === 'string') {
      return error.error;
    }

    if (error.error && error.error.message) {
      return error.error.message;
    }

    if (error.name === 'TimeoutError') {
      return 'Auth service is taking too long. Please try again.';
    }

    return 'Unable to complete registration';
  }
}


