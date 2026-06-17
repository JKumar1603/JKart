import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';

import { Auth, LoginRequest } from '../services/auth';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  loginData: LoginRequest = {
    email: '',
    password: ''
  };

  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private auth: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  login(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Please enter email and password';
      return;
    }

    this.isLoading = true;

    this.auth.login(this.loginData).subscribe({
      next: (response) => {
        this.auth.saveUser(response);
        this.successMessage = 'Login successful';
        this.isLoading = false;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.router.navigate(['/products']);
        }, 500);
      },
      error: (error) => {
        console.log('Login error:', error);

        if (typeof error.error === 'string') {
          this.errorMessage = error.error;
        } else if (error.name === 'TimeoutError') {
          this.errorMessage = 'Auth service is taking too long. Please try again.';
        } else {
          this.errorMessage = 'Invalid email or password';
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}

