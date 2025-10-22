import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// User model
export interface UserProfile {
  id: number;
  name: string;
  phone: string;
  email: string;
  password: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/users';

  constructor(private http: HttpClient) {}

  // Get user by ID
  getUserById(userId: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${userId}`);
  }
}
