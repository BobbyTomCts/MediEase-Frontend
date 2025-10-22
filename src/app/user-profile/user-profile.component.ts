import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, UserProfile as UserProfileModel } from '../services/user.service';
import { InsuranceService, Dependant } from '../services/insurance.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfile implements OnInit {
  @Output() closeProfile = new EventEmitter<void>();

  // User data
  userId: number = 0;
  userProfile: UserProfileModel | null = null;
  
  // Edit mode
  isEditMode: boolean = false;
  editedProfile: any = {};
  
  // Dependants
  dependants: Dependant[] = [];
  showAddDependantPopup: boolean = false;
  newDependant: any = {
    name: '',
    age: 0,
    gender: 'Male',
    relation: 'Spouse'
  };
  
  // Loading states
  isLoadingProfile: boolean = true;
  isLoadingDependants: boolean = true;
  isSavingProfile: boolean = false;
  isAddingDependant: boolean = false;
  
  // Messages
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private userService: UserService,
    private insuranceService: InsuranceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userIdStr = localStorage.getItem('userId');
    if (userIdStr) {
      this.userId = parseInt(userIdStr);
    }
    
    this.loadUserProfile();
    this.loadDependants();
  }

  // Load user profile
  loadUserProfile(): void {
    this.isLoadingProfile = true;
    this.userService.getUserById(this.userId).subscribe({
      next: (data) => {
        this.userProfile = data;
        this.isLoadingProfile = false;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.errorMessage = 'Failed to load profile';
        this.isLoadingProfile = false;
      }
    });
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

  // Enable edit mode
  enableEditMode(): void {
    this.isEditMode = true;
    this.editedProfile = { ...this.userProfile };
  }

  // Cancel edit
  cancelEdit(): void {
    this.isEditMode = false;
    this.editedProfile = {};
  }

  // Save profile (Note: Backend doesn't have update endpoint, so this is UI only)
  saveProfile(): void {
    // Since there's no update endpoint in the backend, we'll just update localStorage
    // In a real app, you'd call an API to update the user
    this.isSavingProfile = true;
    
    setTimeout(() => {
      if (this.editedProfile.name) {
        localStorage.setItem('userName', this.editedProfile.name);
      }
      
      this.userProfile = { ...this.editedProfile };
      this.isEditMode = false;
      this.isSavingProfile = false;
      
      this.successMessage = 'Profile updated successfully! (Note: Changes are local only)';
      setTimeout(() => {
        this.successMessage = '';
      }, 5000);
    }, 1000);
  }

  // Open add dependant popup
  openAddDependantPopup(): void {
    this.showAddDependantPopup = true;
    this.newDependant = {
      name: '',
      age: 0,
      gender: 'Male',
      relation: 'Spouse'
    };
  }

  // Close add dependant popup
  closeAddDependantPopup(): void {
    this.showAddDependantPopup = false;
    this.newDependant = {
      name: '',
      age: 0,
      gender: 'Male',
      relation: 'Spouse'
    };
  }

  // Add dependant
  addDependant(): void {
    if (!this.newDependant.name || this.newDependant.age <= 0) {
      this.errorMessage = 'Please fill all fields correctly';
      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);
      return;
    }

    this.isAddingDependant = true;
    
    this.insuranceService.addDependant(
      this.userId,
      this.newDependant.name,
      this.newDependant.age,
      this.newDependant.gender,
      this.newDependant.relation
    ).subscribe({
      next: (data) => {
        console.log('Dependant added:', data);
        this.dependants.push(data);
        this.isAddingDependant = false;
        this.closeAddDependantPopup();
        
        this.successMessage = 'Dependant added successfully!';
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (err) => {
        console.error('Error adding dependant:', err);
        this.errorMessage = 'Failed to add dependant';
        this.isAddingDependant = false;
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }

  // Navigate to dependants management
  manageDependants(): void {
    this.router.navigate(['/dependants-management']);
  }

  // Close profile
  close(): void {
    this.closeProfile.emit();
  }
}
