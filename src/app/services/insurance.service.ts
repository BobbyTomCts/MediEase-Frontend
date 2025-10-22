import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Insurance model
export interface Insurance {
  insuranceId: number;
  empId: number;
  packageName: string;
  amountRemaining: number;
}

// Request/Claim model
export interface ClaimRequest {
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

// Dependant model
export interface Dependant {
  id: number;
  name: string;
  age: number;
  gender: string;
  relation: string;
  dependantFor: number;
}

// Insurance Package model
export interface InsurancePackage {
  insuranceId: number;
  packageName: string;
  amount: number;
}

@Injectable({
  providedIn: 'root'
})
export class InsuranceService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  // Get employee insurance
  getEmployeeInsurance(empId: number): Observable<Insurance> {
    return this.http.get<Insurance>(`${this.apiUrl}/insurance/${empId}`);
  }

  // Create claim request (without hospital)
  createClaim(empId: number, amount: number): Observable<ClaimRequest> {
    return this.http.post<ClaimRequest>(`${this.apiUrl}/requests/create?empId=${empId}&amount=${amount}&hospitalId=1`, {});
  }

  // Create claim request with hospital
  createClaimWithHospital(empId: number, amount: number, hospitalId: number): Observable<ClaimRequest> {
    return this.http.post<ClaimRequest>(`${this.apiUrl}/requests/create?empId=${empId}&amount=${amount}&hospitalId=${hospitalId}`, {});
  }

  // Get employee claims
  getEmployeeClaims(empId: number): Observable<ClaimRequest[]> {
    return this.http.get<ClaimRequest[]>(`${this.apiUrl}/requests/employee/${empId}`);
  }

  // Get filtered requests (for admin dashboard)
  getFilteredRequests(status?: string, startDate?: string, endDate?: string): Observable<ClaimRequest[]> {
    let url = `${this.apiUrl}/requests/filtered`;
    const params = [];
    
    if (status && status !== 'ALL') {
      params.push(`status=${status}`);
    }
    if (startDate) {
      params.push(`startDate=${startDate}`);
    }
    if (endDate) {
      params.push(`endDate=${endDate}`);
    }
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    return this.http.get<ClaimRequest[]>(url);
  }

  // Get employee dependants
  getEmployeeDependants(empId: number): Observable<Dependant[]> {
    return this.http.get<Dependant[]>(`${this.apiUrl}/insurance/dependants/${empId}`);
  }

  // Add dependant
  addDependant(empId: number, name: string, age: number, gender: string, relation: string): Observable<Dependant> {
    return this.http.post<Dependant>(
      `${this.apiUrl}/insurance/dependant/add?empId=${empId}&name=${name}&age=${age}&gender=${gender}&relation=${relation}`, 
      {}
    );
  }

  // Update dependant
  updateDependant(dependantId: number, name: string, age: number, gender: string, relation: string): Observable<Dependant> {
    return this.http.put<Dependant>(
      `${this.apiUrl}/insurance/dependant/update/${dependantId}?name=${name}&age=${age}&gender=${gender}&relation=${relation}`,
      {}
    );
  }

  // Delete dependant
  deleteDependant(dependantId: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/insurance/dependant/delete/${dependantId}`);
  }

  // Get all insurance packages
  getAllPackages(): Observable<InsurancePackage[]> {
    return this.http.get<InsurancePackage[]>(`${this.apiUrl}/insurance/packages`);
  }

  // Create insurance for employee
  createInsurance(empId: number, packageId: number): Observable<Insurance> {
    return this.http.post<Insurance>(`${this.apiUrl}/insurance/create?empId=${empId}&packageId=${packageId}`, {});
  }
}
