import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HospitalService, Hospital } from '../services/hospital.service';

@Component({
  selector: 'app-network-hospitals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './network-hospitals.component.html',
  styleUrls: ['./network-hospitals.component.css']
})
export class NetworkHospitals implements OnInit {
  hospitals: Hospital[] = [];
  filteredHospitals: Hospital[] = [];
  selectedHospital: Hospital | null = null;
  
  searchTerm: string = '';
  selectedState: string = '';
  selectedCity: string = '';
  
  states: string[] = [];
  cities: string[] = [];
  
  isLoading: boolean = false;

  constructor(
    private hospitalService: HospitalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadHospitals();
  }

  loadHospitals(): void {
    this.isLoading = true;
    this.hospitalService.getAllHospitals().subscribe({
      next: (data) => {
        this.hospitals = data;
        this.filteredHospitals = data;
        this.extractStatesAndCities();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading hospitals:', error);
        this.isLoading = false;
      }
    });
  }

  extractStatesAndCities(): void {
    const stateSet = new Set<string>();
    const citySet = new Set<string>();
    
    this.hospitals.forEach(hospital => {
      if (hospital.state) stateSet.add(hospital.state);
      if (hospital.city) citySet.add(hospital.city);
    });
    
    this.states = Array.from(stateSet).sort();
    this.cities = Array.from(citySet).sort();
  }

  filterHospitals(): void {
    this.filteredHospitals = this.hospitals.filter(hospital => {
      const matchesSearch = !this.searchTerm || 
        hospital.hospitalName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        hospital.city.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (hospital.specialties && hospital.specialties.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesState = !this.selectedState || hospital.state === this.selectedState;
      const matchesCity = !this.selectedCity || hospital.city === this.selectedCity;
      
      return matchesSearch && matchesState && matchesCity;
    });
  }
  
  getSpecialtiesArray(specialties: string): string[] {
    if (!specialties) return [];
    return specialties.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  toggleHospital(hospital: Hospital): void {
    if (this.selectedHospital?.id === hospital.id) {
      this.selectedHospital = null;
    } else {
      this.selectedHospital = hospital;
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedState = '';
    this.selectedCity = '';
    this.filteredHospitals = this.hospitals;
  }

  getDirections(hospital: Hospital): void {
    const address = encodeURIComponent(`${hospital.hospitalName}, ${hospital.address}, ${hospital.city}, ${hospital.state}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
    window.open(url, '_blank');
  }

  callHospital(phone: string): void {
    window.location.href = `tel:${phone}`;
  }

  goBack(): void {
    this.router.navigate(['/user-dashboard']);
  }
}
