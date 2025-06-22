import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User, UserRole } from '../models/user.model';
import { environment } from '../../environments/environment';

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken?: string;
    token?: string;
    jwt?: string;
  };
}

interface RefreshResponse {
  success: boolean;
  message: string;
  data: {
    accessToken?: string;
    token?: string;
    jwt?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }
  }

  private extractToken(data: any): string | null {
    // Try different possible token field names and locations
    let token = data.accessToken || data.token || data.jwt;
    
    // If not found in data, check if it's directly in the response
    if (!token && data.accessToken === undefined && data.token === undefined && data.jwt === undefined) {
      // The token might be in a different location or the backend might not be sending it
      // For now, let's check if there's a token field at the root level
      token = (data as any).accessToken || (data as any).token || (data as any).jwt;
    }
    
    if (!token) {
      console.warn('AuthService: No token found in response data:', data);
      // Don't throw error, just return null - the backend might be using HttpOnly cookies
      return null;
    }
    return token;
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, { email, password })
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Login failed');
          }
          
          const { user } = response.data;
          const token = this.extractToken(response.data);
          
          // Only store token if it exists in the response
          if (token) {
            localStorage.setItem('token', token);
          }
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  register(userData: any): Observable<User> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, userData)
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Registration failed');
          }
          
          const { user } = response.data;
          const token = this.extractToken(response.data);
          
          // Only store token if it exists in the response
          if (token) {
            localStorage.setItem('token', token);
          }
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    this.http.post(`${this.API_URL}/auth/logout`, {}).subscribe();
    
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  refreshToken(): Observable<string | null> {
    return this.http.post<RefreshResponse>(`${this.API_URL}/auth/refresh`, {})
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Token refresh failed');
          }
          
          const token = this.extractToken(response.data);
          if (token) {
            localStorage.setItem('token', token);
          }
          return token;
        }),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.hasToken() && !!this.getCurrentUser();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    const role = typeof user.role === 'string' ? user.role : user.role?.code;
    return role === UserRole.ADMIN;
  }

  isEditor(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    const role = typeof user.role === 'string' ? user.role : user.role?.code;
    return role === UserRole.EDITOR;
  }

  isWriter(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    const role = typeof user.role === 'string' ? user.role : user.role?.code;
    return role === UserRole.WRITER;
  }

  isReader(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    const role = typeof user.role === 'string' ? user.role : user.role?.code;
    return role === UserRole.READER;
  }

  canManageUsers(): boolean {
    return this.isAdmin();
  }

  canManageArticles(): boolean {
    return this.isAdmin() || this.isEditor();
  }

  canWriteArticles(): boolean {
    return this.isAdmin() || this.isEditor() || this.isWriter();
  }

  canPublishArticles(): boolean {
    return this.isAdmin() || this.isEditor();
  }
} 