import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, User } from '../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class Register {
  // User object to hold form data
  user: User = {
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'EMPLOYEE'
  };

  message: string = '';
  messageType: string = ''; // 'success' or 'error'
  isLoading: boolean = false;

  constructor(private authService: Auth, private router: Router) {}

  // Handle registration
  onRegister(): void {
    // Validate form
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.message = '';

    this.authService.register(this.user).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.messageType = 'success';
        this.message = 'Registration successful! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.messageType = 'error';
        
        // Handle specific error messages from backend
        if (error.status === 409) {
          this.message = 'User account already exists with this email';
        } else if (error.error && error.error.message) {
          this.message = error.error.message;
        } else {
          this.message = 'Registration failed. Please try again.';
        }
        
        console.error('Registration error:', error);
      }
    });
  }

  // Validate form
  validateForm(): boolean {
    if (!this.user.name || !this.user.name.trim()) {
      this.messageType = 'error';
      this.message = 'Please enter your full name';
      return false;
    }

    if (!this.user.phone || !this.user.phone.trim()) {
      this.messageType = 'error';
      this.message = 'Please enter your phone number';
      return false;
    }

    if (!this.user.email || !this.user.email.trim()) {
      this.messageType = 'error';
      this.message = 'Please enter your email address';
      return false;
    }

    // Simple email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.user.email)) {
      this.messageType = 'error';
      this.message = 'Please enter a valid email address';
      return false;
    }

    if (!this.user.password || !this.user.password.trim()) {
      this.messageType = 'error';
      this.message = 'Please enter a password';
      return false;
    }

    if (this.user.password.length < 6) {
      this.messageType = 'error';
      this.message = 'Password must be at least 6 characters';
      return false;
    }

    return true;
  }

  // Navigate to login page
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
