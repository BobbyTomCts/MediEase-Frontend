import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { InsuranceService, Dependant } from '../services/insurance.service';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-dependants-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dependants-management.component.html',
  styleUrls: ['./dependants-management.component.css']
})
export class DependantsManagement implements OnInit {
  userId: number = 0;
  userName: string = '';
  dependants: Dependant[] = [];
  isSetupMode: boolean = false; // true when coming from insurance selection
  selectedPackageId: number | null = null;
  
  // Loading states
  isLoadingDependants: boolean = true;
  isCreatingInsurance: boolean = false;
  
  // Add/Edit dependant
  showDependantForm: boolean = false;
  isEditMode: boolean = false;
  currentDependantId: number | null = null;
  dependantForm = {
    name: '',
    age: 0,
    gender: 'Male',
    relation: 'Spouse'
  };
  
  // Messages
  successMessage: string = '';
  errorMessage: string = '';
  formError: string = '';

  constructor(
    private insuranceService: InsuranceService,
    private authService: Auth,
    private router: Router,
    private route: ActivatedRoute
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

    // Check if in setup mode
    this.route.queryParams.subscribe(params => {
      this.isSetupMode = params['setup'] === 'true';
      
      if (this.isSetupMode) {
        // Get selected package from localStorage
        const packageIdStr = localStorage.getItem('selectedPackageId');
        if (packageIdStr) {
          this.selectedPackageId = parseInt(packageIdStr);
        } else {
          // No package selected, redirect back
          this.router.navigate(['/insurance-selection']);
          return;
        }
      }
    });

    // Load dependants
    this.loadDependants();
  }

  // Load dependants
  loadDependants(): void {
    this.isLoadingDependants = true;
    this.insuranceService.getEmployeeDependants(this.userId).subscribe({
      next: (data) => {
        this.dependants = data;
        this.isLoadingDependants = false;
      },
      error: (err) => {
        console.log('No dependants found or error:', err);
        this.dependants = [];
        this.isLoadingDependants = false;
      }
    });
  }

  // Open add form
  openAddForm(): void {
    this.isEditMode = false;
    this.currentDependantId = null;
    this.dependantForm = {
      name: '',
      age: 0,
      gender: 'Male',
      relation: 'Spouse'
    };
    this.formError = '';
    this.showDependantForm = true;
  }

  // Open edit form
  openEditForm(dependant: Dependant): void {
    this.isEditMode = true;
    this.currentDependantId = dependant.id;
    this.dependantForm = {
      name: dependant.name,
      age: dependant.age,
      gender: dependant.gender,
      relation: dependant.relation
    };
    this.formError = '';
    this.showDependantForm = true;
  }

  // Close form
  closeForm(): void {
    this.showDependantForm = false;
    this.formError = '';
  }

  // Save dependant (add or edit)
  saveDependant(): void {
    // Validate
    if (!this.dependantForm.name || this.dependantForm.age <= 0) {
      this.formError = 'Please fill all fields correctly';
      return;
    }

    if (this.isEditMode && this.currentDependantId) {
      // Update existing dependant
      this.insuranceService.updateDependant(
        this.currentDependantId,
        this.dependantForm.name,
        this.dependantForm.age,
        this.dependantForm.gender,
        this.dependantForm.relation
      ).subscribe({
        next: (data) => {
          // Update in local array
          const index = this.dependants.findIndex(d => d.id === this.currentDependantId);
          if (index !== -1) {
            this.dependants[index] = data;
          }
          this.showSuccessMessage('Dependant updated successfully!');
          this.closeForm();
        },
        error: (err) => {
          console.error('Error updating dependant:', err);
          this.formError = 'Failed to update dependant';
        }
      });
    } else {
      // Add new dependant
      this.insuranceService.addDependant(
        this.userId,
        this.dependantForm.name,
        this.dependantForm.age,
        this.dependantForm.gender,
        this.dependantForm.relation
      ).subscribe({
        next: (data) => {
          this.dependants.push(data);
          this.showSuccessMessage('Dependant added successfully!');
          this.closeForm();
        },
        error: (err) => {
          console.error('Error adding dependant:', err);
          this.formError = 'Failed to add dependant';
        }
      });
    }
  }

  // Delete dependant
  deleteDependant(dependantId: number): void {
    if (!confirm('Are you sure you want to remove this dependant?')) {
      return;
    }

    this.insuranceService.deleteDependant(dependantId).subscribe({
      next: () => {
        this.dependants = this.dependants.filter(d => d.id !== dependantId);
        this.showSuccessMessage('Dependant removed successfully!');
      },
      error: (err) => {
        console.error('Error deleting dependant:', err);
        this.showErrorMessage('Failed to remove dependant');
      }
    });
  }

  // Submit insurance (in setup mode)
  submitInsurance(): void {
    if (!this.selectedPackageId) {
      this.showErrorMessage('No package selected');
      return;
    }

    this.isCreatingInsurance = true;
    
    this.insuranceService.createInsurance(this.userId, this.selectedPackageId).subscribe({
      next: (data) => {
        console.log('Insurance created:', data);
        
        // Clear selected package from localStorage
        localStorage.removeItem('selectedPackageId');
        
        // Show success message
        this.successMessage = 'Insurance created successfully! Redirecting...';
        
        // Redirect to user dashboard after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/user-dashboard']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error creating insurance:', err);
        this.isCreatingInsurance = false;
        this.showErrorMessage('Failed to create insurance. Please try again.');
      }
    });
  }

  // Skip dependants (in setup mode)
  skipDependants(): void {
    this.submitInsurance();
  }

  // Go back
  goBack(): void {
    if (this.isSetupMode) {
      this.router.navigate(['/insurance-selection']);
    } else {
      this.router.navigate(['/user-dashboard']);
    }
  }

  // Logout
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Show success message
  showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  // Show error message
  showErrorMessage(message: string): void {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }
}
