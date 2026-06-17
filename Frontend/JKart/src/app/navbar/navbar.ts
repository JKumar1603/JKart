import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Auth } from '../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

  searchText = '';
  isAccountMenuOpen = false;

  constructor(public auth: Auth, private router: Router) { }

  searchProducts(): void {
    const value = this.searchText.trim();

    if (!value) {
      this.router.navigate(['/products']);
      return;
    }

    this.isAccountMenuOpen = false;

    this.router.navigate(['/products'], {
      queryParams: {
        search: value
      }
    });
  }

  goToCategory(category: string): void {
    this.searchText = '';
    this.isAccountMenuOpen = false;

    this.router.navigate(['/products'], {
      queryParams: {
        category: category
      }
    });
  }

  toggleAccountMenu(): void {
    this.isAccountMenuOpen = !this.isAccountMenuOpen;
  }

  closeAccountMenu(): void {
    this.isAccountMenuOpen = false;
  }

  logout(): void {
    this.isAccountMenuOpen = false;
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
