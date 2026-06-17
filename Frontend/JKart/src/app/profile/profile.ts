import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Auth } from '../services/auth';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  userId = 0;
  name = '';
  email = '';
  role = '';
  mobile = '';
  city = '';
  address = '';

  editMode = false;
  successMessage = '';
  errorMessage = '';

  constructor(public auth: Auth, private router: Router) { }

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadProfile();
  }

  loadProfile(): void {
    this.userId = this.auth.getUserId();
    this.name = localStorage.getItem('name') || this.auth.getName();
    this.email = localStorage.getItem('email') || this.auth.getEmail();
    this.role = localStorage.getItem('role') || this.auth.getRole();
    this.mobile = localStorage.getItem('mobile') || '';
    this.city = localStorage.getItem('city') || '';
    this.address = localStorage.getItem('address') || '';
  }

  enableEdit(): void {
    this.editMode = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  cancelEdit(): void {
    this.editMode = false;
    this.successMessage = '';
    this.errorMessage = '';
    this.loadProfile();
  }

  saveProfile(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.name.trim() || !this.email.trim()) {
      this.errorMessage = 'Name and email are required';
      return;
    }

    if (this.mobile && !/^[0-9]{10}$/.test(this.mobile.trim())) {
      this.errorMessage = 'Mobile number should be 10 digits';
      return;
    }

    localStorage.setItem('name', this.name.trim());
    localStorage.setItem('email', this.email.trim());
    localStorage.setItem('mobile', this.mobile.trim());
    localStorage.setItem('city', this.city.trim());
    localStorage.setItem('address', this.address.trim());

    this.editMode = false;
    this.successMessage = 'Profile updated successfully';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  getInitial(): string {
    if (!this.name) {
      return 'J';
    }

    return this.name.charAt(0).toUpperCase();
  }
}
