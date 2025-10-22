import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Hospital {
  id: number;
  hospitalName: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  specialties: string;
  copayPercentage: number;
  latitude?: number;
  longitude?: number;
}

@Injectable({
  providedIn: 'root'
})
export class HospitalService {
  private apiUrl = '/api/hospitals';

  constructor(private http: HttpClient) {}

  // Get all network hospitals
  getAllHospitals(): Observable<Hospital[]> {
    return this.http.get<Hospital[]>(`${this.apiUrl}/all`);
  }

  // Get hospitals by city
  getHospitalsByCity(city: string): Observable<Hospital[]> {
    return this.http.get<Hospital[]>(`${this.apiUrl}/city/${city}`);
  }

  // Get hospitals by state
  getHospitalsByState(state: string): Observable<Hospital[]> {
    return this.http.get<Hospital[]>(`${this.apiUrl}/state/${state}`);
  }

  // Get hospital by ID
  getHospitalById(id: number): Observable<Hospital> {
    return this.http.get<Hospital>(`${this.apiUrl}/${id}`);
  }
}
