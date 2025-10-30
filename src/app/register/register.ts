import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, User } from '../services/auth';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="card">
        <h1>Create Account</h1>
        <p class="subtitle">Join MediEase today</p>
        
        <form (ngSubmit)="onRegister()">
          <div class="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              [(ngModel)]="user.name" 
              name="name" 
              placeholder="Enter your full name"
              required>
          </div>

          <div class="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              [(ngModel)]="user.phone" 
              name="phone" 
              placeholder="Enter your phone number"
              required>
          </div>

          <div class="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              [(ngModel)]="user.email" 
              name="email" 
              placeholder="Enter your email"
              required>
          </div>

          <div class="form-group">
            <label>Password</label>
            <input 
              type="password" 
              [(ngModel)]="user.password" 
              name="password" 
              placeholder="Create a password"
              required>
          </div>

          <div class="form-group">
            <label>Role</label>
            <select [(ngModel)]="user.role" name="role" required>
              <option value="EMPLOYEE">Employee</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button type="submit" class="btn-primary">Register</button>
        </form>

        <div class="message" *ngIf="message">{{ message }}</div>

        <p class="link-text">
          Already have an account? 
          <a (click)="goToLogin()">Sign In</a>
        </p>
      </div>
    </div>
  `,
  styles: `
    .container {
      width: 100%;
      max-width: 450px;
      padding: 20px;
    }

    .card {
      background: white;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    h1 {
      color: #333;
      font-size: 32px;
      font-weight: 600;
      margin-bottom: 10px;
      text-align: center;
    }

    .subtitle {
      color: #666;
      text-align: center;
      margin-bottom: 30px;
      font-size: 14px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      color: #333;
      font-weight: 500;
      margin-bottom: 8px;
      font-size: 14px;
    }

    input, select {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 14px;
      transition: all 0.3s;
      font-family: 'Poppins', sans-serif;
    }

    input:focus, select:focus {
      outline: none;
      border-color: #667eea;
    }

    .btn-primary {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
      margin-top: 10px;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
    }

    .message {
      margin-top: 20px;
      padding: 12px;
      background: #e8f5e9;
      color: #2e7d32;
      border-radius: 8px;
      text-align: center;
      font-size: 14px;
    }

    .link-text {
      text-align: center;
      margin-top: 20px;
      color: #666;
      font-size: 14px;
    }

    .link-text a {
      color: #667eea;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
    }

    .link-text a:hover {
      text-decoration: underline;
    }
  `
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

  constructor(private authService: Auth, private router: Router) {}

  // Handle registration
  onRegister(): void {
    this.authService.register(this.user).subscribe({
      next: (response) => {
        this.message = 'Registration successful! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.message = 'Registration failed. Please try again.';
        console.error('Registration error:', error);
      }
    });
  }

  // Navigate to login page
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
