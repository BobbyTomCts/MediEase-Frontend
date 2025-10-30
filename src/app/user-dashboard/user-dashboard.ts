import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-user-dashboard',
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <div class="header">
        <div class="logo">
          <h2>MediEase</h2>
        </div>
        <div class="user-info">
          <span class="welcome">Welcome, {{ userName }}</span>
          <button class="btn-logout" (click)="logout()">Logout</button>
        </div>
      </div>

      <div class="content">
        <div class="welcome-card">
          <h1>Employee Dashboard</h1>
          <p>Manage your insurance and claims</p>
        </div>

        <div class="cards-grid">
          <div class="info-card">
            <h3>My Profile</h3>
            <p>View and update your personal information</p>
          </div>

          <div class="info-card">
            <h3>Insurance</h3>
            <p>View your insurance coverage and details</p>
          </div>

          <div class="info-card">
            <h3>Dependants</h3>
            <p>Manage your family members</p>
          </div>

          <div class="info-card">
            <h3>Claims</h3>
            <p>Submit and track your insurance claims</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .dashboard {
      width: 100%;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .header {
      background: white;
      padding: 20px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .logo h2 {
      color: #667eea;
      font-size: 28px;
      font-weight: 700;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .welcome {
      color: #333;
      font-weight: 500;
      font-size: 16px;
    }

    .btn-logout {
      padding: 10px 24px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-logout:hover {
      background: #764ba2;
      transform: translateY(-2px);
    }

    .content {
      padding: 40px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-card {
      background: white;
      padding: 40px;
      border-radius: 20px;
      text-align: center;
      margin-bottom: 40px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    .welcome-card h1 {
      color: #333;
      font-size: 36px;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .welcome-card p {
      color: #666;
      font-size: 18px;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
    }

    .info-card {
      background: white;
      padding: 30px;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      transition: all 0.3s;
      cursor: pointer;
    }

    .info-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
    }

    .info-card h3 {
      color: #333;
      font-size: 22px;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .info-card p {
      color: #666;
      font-size: 14px;
      line-height: 1.6;
    }
  `
})
export class UserDashboard implements OnInit {
  userName: string = '';

  constructor(private authService: Auth, private router: Router) {}

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Check if user is admin (should not access this page)
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin-dashboard']);
      return;
    }

    // Get user name from localStorage
    this.userName = this.authService.getUserName() || 'User';
  }

  // Logout function
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
