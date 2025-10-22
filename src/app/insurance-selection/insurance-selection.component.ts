import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InsuranceService, InsurancePackage } from '../services/insurance.service';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-insurance-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './insurance-selection.component.html',
  styleUrls: ['./insurance-selection.component.css']
})
export class InsuranceSelection implements OnInit {
  userId: number = 0;
  userName: string = '';
  packages: InsurancePackage[] = [];
  selectedPackageId: number | null = null;
  isLoadingPackages: boolean = true;
  errorMessage: string = '';

  constructor(
    private insuranceService: InsuranceService,
    private authService: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Get user data
    const userIdStr = localStorage.getItem('userId');
    if (userIdStr) {
      this.userId = parseInt(userIdStr);
    }
    this.userName = this.authService.getUserName() || 'User';

    // Load available packages
    this.loadPackages();
  }

  // Load insurance packages
  loadPackages(): void {
    this.isLoadingPackages = true;
    this.insuranceService.getAllPackages().subscribe({
      next: (data) => {
        this.packages = data;
        this.isLoadingPackages = false;
      },
      error: (err) => {
        console.error('Error loading packages:', err);
        this.errorMessage = 'Failed to load insurance packages';
        this.isLoadingPackages = false;
      }
    });
  }

  // Select package
  selectPackage(packageId: number): void {
    this.selectedPackageId = packageId;
  }

  // Proceed to dependants
  proceedToDependants(): void {
    if (!this.selectedPackageId) {
      this.errorMessage = 'Please select an insurance package';
      return;
    }

    // Store selected package in localStorage
    localStorage.setItem('selectedPackageId', this.selectedPackageId.toString());
    
    // Navigate to dependants management
    this.router.navigate(['/dependants-management'], { 
      queryParams: { setup: 'true' } 
    });
  }

  // Logout
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Format currency
  formatCurrency(amount: number): string {
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
