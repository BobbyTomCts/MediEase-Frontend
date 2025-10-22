import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface for User
export interface User {
  id?: number;
  name: string;
  phone: string;
  email: string;
  password: string;
  role?: string;
}

// Interface for Login Response
export interface LoginResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  admin: boolean;  // Changed from isAdmin to admin to match backend
  message: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  // Backend API URL
  private apiUrl = '/api/users';

  constructor(private http: HttpClient) { }

  // Register new user
  register(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, user);
  }

  // Login user
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login?email=${email}&password=${password}`, {});
  }

  // Save user data and token to localStorage
  saveUserData(response: LoginResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('userId', response.id.toString());
    localStorage.setItem('userName', response.name);
    localStorage.setItem('userEmail', response.email);
    localStorage.setItem('userRole', response.role);
    localStorage.setItem('isAdmin', response.admin.toString());  // Changed from response.isAdmin to response.admin
  }

  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Check if user is admin
  isAdmin(): boolean {
    return localStorage.getItem('isAdmin') === 'true';
  }

  // Get user name
  getUserName(): string | null {
    return localStorage.getItem('userName');
  }

  // Logout user
  logout(): void {
    localStorage.clear();
  }
}
