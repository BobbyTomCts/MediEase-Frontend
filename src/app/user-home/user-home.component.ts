import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';
import { InsuranceService, Insurance, ClaimRequest } from '../services/insurance.service';
import { HospitalService, Hospital } from '../services/hospital.service';
import { UserProfile } from '../user-profile/user-profile.component';

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [CommonModule, FormsModule, UserProfile],
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.css']
})
export class UserHome implements OnInit {
  // User data
  userId: number = 0;
  userName: string = '';
  
  // Insurance data
  hasInsurance: boolean = false;
  insurance: Insurance | null = null;
  
  // Claims data
  claims: ClaimRequest[] = [];
  
  // Hospital data
  hospitals: Hospital[] = [];
  selectedHospitalId: number | null = null;
  selectedHospital: Hospital | null = null;
  
  // Claim popup
  showClaimPopup: boolean = false;
  claimAmount: number = 0;
  claimError: string = '';
  isSubmittingClaim: boolean = false;
  
  // Loading states
  isLoadingInsurance: boolean = true;
  isLoadingClaims: boolean = true;
  isLoadingHospitals: boolean = true;
  
  // Success message
  successMessage: string = '';
  
  // Show profile section
  showProfile: boolean = false;

  constructor(
    private authService: Auth,
    private insuranceService: InsuranceService,
    private hospitalService: HospitalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Check if user is admin
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin-dashboard']);
      return;
    }

    // Get user data from localStorage
    const userIdStr = localStorage.getItem('userId');
    if (userIdStr) {
      this.userId = parseInt(userIdStr);
    }
    this.userName = this.authService.getUserName() || 'User';

    // Load data
    this.loadInsurance();
    this.loadClaims();
    this.loadHospitals();
  }

  // Load employee insurance
  loadInsurance(): void {
    this.isLoadingInsurance = true;
    this.insuranceService.getEmployeeInsurance(this.userId).subscribe({
      next: (data) => {
        console.log('📦 Insurance API Response:', data);
        
        // Check if data is null or empty (backend returns 200 with null/empty for no insurance)
        if (!data || Object.keys(data).length === 0) {
          console.log('🔴 No insurance found (empty response)!');
          console.log('🔴 User ID:', this.userId);
          this.hasInsurance = false;
          this.isLoadingInsurance = false;
          
          // Redirect to insurance selection
          console.log('⏳ Will redirect in 1.5 seconds...');
          setTimeout(() => {
            console.log('🚀 REDIRECTING NOW to /insurance-selection');
            this.router.navigate(['/insurance-selection']);
          }, 1500);
        } else {
          console.log('✅ Insurance found:', data);
          this.insurance = data;
          this.hasInsurance = true;
          this.isLoadingInsurance = false;
        }
      },
      error: (err) => {
        console.log('🔴 No insurance found! Error:', err);
        console.log('🔴 User ID:', this.userId);
        console.log('🔴 Setting hasInsurance = false');
        this.hasInsurance = false;
        this.isLoadingInsurance = false;
        
        // Redirect to insurance selection if no insurance found
        console.log('⏳ Will redirect in 1.5 seconds...');
        setTimeout(() => {
          console.log('🚀 REDIRECTING NOW to /insurance-selection');
          this.router.navigate(['/insurance-selection']);
        }, 1500);
      }
    });
  }

  // Load employee claims
  loadClaims(): void {
    this.isLoadingClaims = true;
    this.insuranceService.getEmployeeClaims(this.userId).subscribe({
      next: (data) => {
        this.claims = data.sort((a, b) => b.requestId - a.requestId);
        this.isLoadingClaims = false;
      },
      error: (err) => {
        console.error('Error loading claims:', err);
        this.isLoadingClaims = false;
      }
    });
  }

  // Load hospitals
  loadHospitals(): void {
    this.isLoadingHospitals = true;
    this.hospitalService.getAllHospitals().subscribe({
      next: (data) => {
        this.hospitals = data;
        this.isLoadingHospitals = false;
      },
      error: (err) => {
        console.error('Error loading hospitals:', err);
        this.isLoadingHospitals = false;
      }
    });
  }

  // Open claim popup
  openClaimPopup(): void {
    this.showClaimPopup = true;
    this.claimAmount = 0;
    this.claimError = '';
    this.selectedHospitalId = null;
    this.selectedHospital = null;
  }

  // Close claim popup
  closeClaimPopup(): void {
    this.showClaimPopup = false;
    this.claimAmount = 0;
    this.claimError = '';
    this.selectedHospitalId = null;
    this.selectedHospital = null;
  }

  // Handle hospital selection change
  onHospitalChange(): void {
    if (this.selectedHospitalId) {
      this.selectedHospital = this.hospitals.find(h => h.id === this.selectedHospitalId) || null;
    } else {
      this.selectedHospital = null;
    }
  }

  // Calculate copay amount
  calculateCopay(): number {
    if (this.selectedHospital && this.claimAmount > 0) {
      return (this.claimAmount * this.selectedHospital.copayPercentage) / 100;
    }
    return 0;
  }

  // Calculate approved amount (after copay deduction)
  calculateApprovedAmount(): number {
    return this.claimAmount - this.calculateCopay();
  }

  // Submit claim
  submitClaim(): void {
    // Validate hospital selection
    if (!this.selectedHospitalId) {
      this.claimError = 'Please select a hospital';
      return;
    }

    // Validate amount
    if (!this.claimAmount || this.claimAmount <= 0) {
      this.claimError = 'Please enter a valid amount';
      return;
    }

    // Check if amount is less than or equal to remaining amount
    if (this.insurance && this.claimAmount > this.insurance.amountRemaining) {
      this.claimError = `Entered amount (₹${this.claimAmount}) is greater than amount remaining (₹${this.insurance.amountRemaining})`;
      return;
    }

    // Submit claim
    this.isSubmittingClaim = true;
    this.claimError = '';

    this.insuranceService.createClaimWithHospital(this.userId, this.claimAmount, this.selectedHospitalId).subscribe({
      next: (data) => {
        console.log('Claim created:', data);
        this.isSubmittingClaim = false;
        this.closeClaimPopup();
        
        // Show success message
        this.successMessage = 'Claim submitted successfully! Waiting for admin approval.';
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
        
        // Reload claims
        this.loadClaims();
      },
      error: (err) => {
        console.error('Error creating claim:', err);
        this.claimError = 'Failed to submit claim. Please try again.';
        this.isSubmittingClaim = false;
      }
    });
  }

  // Navigate to profile
  goToProfile(): void {
    this.showProfile = true;
  }

  // Close profile
  closeProfile(): void {
    this.showProfile = false;
  }

  // Navigate to home
  goToHome(): void {
    this.showProfile = false;
  }

  // Navigate to network hospitals
  goToNetworkHospitals(): void {
    this.router.navigate(['/network-hospitals']);
  }

  // Logout
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Get status badge class
  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  // Format currency
  formatCurrency(amount: number): string {
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
