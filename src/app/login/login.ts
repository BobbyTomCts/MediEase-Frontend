import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="card">
        <h1>Welcome Back</h1>
        <p class="subtitle">Sign in to your account</p>
        
        <form (ngSubmit)="onLogin()">
          <div class="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              [(ngModel)]="email" 
              name="email" 
              placeholder="Enter your email"
              required>
          </div>

          <div class="form-group">
            <label>Password</label>
            <input 
              type="password" 
              [(ngModel)]="password" 
              name="password" 
              placeholder="Enter your password"
              required>
          </div>

          <button type="submit" class="btn-primary">Sign In</button>
        </form>

        <div class="message" *ngIf="message" [class.error]="isError">
          {{ message }}
        </div>

        <p class="link-text">
          Don't have an account? 
          <a (click)="goToRegister()">Create Account</a>
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

    input {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 14px;
      transition: all 0.3s;
      font-family: 'Poppins', sans-serif;
    }

    input:focus {
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

    .message.error {
      background: #ffebee;
      color: #c62828;
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
export class Login {
  email: string = '';
  password: string = '';
  message: string = '';
  isError: boolean = false;

  constructor(private authService: Auth, private router: Router) {}

  // Handle login
  onLogin(): void {
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        if (response.token) {
          // Save user data to localStorage
          this.authService.saveUserData(response);
          
          this.message = 'Login successful! Redirecting...';
          this.isError = false;

          // Redirect based on role
          setTimeout(() => {
            if (response.admin) {
              this.router.navigate(['/admin-dashboard']);
            } else {
              this.router.navigate(['/user-dashboard']);
            }
          }, 1500);
        } else {
          this.message = response.message || 'Login failed';
          this.isError = true;
        }
      },
      error: (error) => {
        this.message = 'Invalid email or password';
        this.isError = true;
        console.error('Login error:', error);
      }
    });
  }

  // Navigate to register page
  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
