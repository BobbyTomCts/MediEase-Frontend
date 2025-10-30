import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../services/auth';
import { InsuranceService, ClaimRequest } from '../services/insurance.service';

// Interface for Request
export interface Request {
  requestId: number;
  empId: number;
  requestAmount: number;
  approvedAmount?: number;
  copayAmount?: number;
  status: string;
  hospitalId?: number;
  createdAt?: string;
  approvedAt?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboard implements OnInit {
  userName: string = '';
  requests: Request[] = [];
  filteredRequests: Request[] = [];
  loading: boolean = false;
  message: string = '';

  // Filter properties
  selectedStatus: string = 'ALL';
  startDate: string = '';
  endDate: string = '';
  
  // Status options
  statusOptions: string[] = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

  constructor(
    private authService: Auth,
    private router: Router,
    private http: HttpClient,
    private insuranceService: InsuranceService
  ) {}

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Check if user is admin
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/user-dashboard']);
      return;
    }

    // Get user name
    this.userName = this.authService.getUserName() || 'Admin';

    // Load all requests
    this.loadRequests();
  }

  // Load all insurance requests
  loadRequests(): void {
    this.loading = true;
    this.http.get<Request[]>('/api/requests/all').subscribe({
      next: (data) => {
        this.requests = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading requests:', error);
        this.loading = false;
        this.message = 'Error loading requests';
        setTimeout(() => this.message = '', 3000);
      }
    });
  }

  // Apply filters to requests
  applyFilters(): void {
    let filtered = [...this.requests];

    // Filter by status
    if (this.selectedStatus !== 'ALL') {
      filtered = filtered.filter(r => r.status === this.selectedStatus);
    }

    // Filter by date range
    if (this.startDate) {
      const start = new Date(this.startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(r => {
        if (r.createdAt) {
          return new Date(r.createdAt) >= start;
        }
        return false;
      });
    }

    if (this.endDate) {
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(r => {
        if (r.createdAt) {
          return new Date(r.createdAt) <= end;
        }
        return false;
      });
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return b.requestId - a.requestId;
    });

    this.filteredRequests = filtered;
  }

  // Clear filters
  clearFilters(): void {
    this.selectedStatus = 'ALL';
    this.startDate = '';
    this.endDate = '';
    this.applyFilters();
  }

  // Handle filter change
  onFilterChange(): void {
    this.applyFilters();
  }

  // Approve a request
  approveRequest(requestId: number): void {
    this.http.put<Request>(`/api/requests/approve/${requestId}`, {}).subscribe({
      next: (response) => {
        this.message = 'Request approved successfully!';
        this.loadRequests(); // Reload the list
        setTimeout(() => this.message = '', 3000);
      },
      error: (error) => {
        console.error('Error approving request:', error);
        this.message = 'Error approving request';
        setTimeout(() => this.message = '', 3000);
      }
    });
  }

  // Reject a request
  rejectRequest(requestId: number): void {
    this.http.put<Request>(`/api/requests/reject/${requestId}`, {}).subscribe({
      next: (response) => {
        this.message = 'Request rejected successfully!';
        this.loadRequests(); // Reload the list
        setTimeout(() => this.message = '', 3000);
      },
      error: (error) => {
        console.error('Error rejecting request:', error);
        this.message = 'Error rejecting request';
        setTimeout(() => this.message = '', 3000);
      }
    });
  }

  // Get status badge class
  getStatusClass(status: string): string {
    if (status === 'APPROVED') return 'status-approved';
    if (status === 'REJECTED') return 'status-rejected';
    return 'status-pending';
  }

  // Format currency
  formatCurrency(amount: number): string {
    if (!amount) return '-';
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Format date
  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN') + ' ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  // Get request count by status
  getRequestCountByStatus(status: string): number {
    if (status === 'ALL') {
      return this.requests.length;
    }
    return this.requests.filter(r => r.status === status).length;
  }

  // Logout
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
