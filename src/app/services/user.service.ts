import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';
import { User, UserRole } from '../models/user.model';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    limit: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    hasMore: boolean;
    docs: T[];
    totalDocs: number;
    totalPages: number;
    page: number;
    pagingCounter: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) { }

  private checkAuth(): boolean {
    if (!this.authService.hasToken()) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }

  getUsers(): Observable<User[]> {
    if (!this.checkAuth()) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<PaginatedResponse<User>>(`${this.API_URL}/admin/users`)
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Backend request failed');
          }
          
          if (!response.data || !response.data.docs) {
            throw new Error('No data returned from server');
          }
          
          return response.data.docs;
        }),
        map(users => users.map(user => this.mapUserRole(user)))
      );
  }

  getUser(id: string): Observable<User> {
    if (!this.checkAuth()) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<BackendResponse<User>>(`${this.API_URL}/admin/users/${id}`)
      .pipe(
        map(response => response.data),
        map(user => this.mapUserRole(user))
      );
  }

  updateUser(id: string, userData: Partial<User>): Observable<User> {
    if (!this.checkAuth()) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.put<BackendResponse<User>>(`${this.API_URL}/admin/users/${id}`, userData)
      .pipe(
        map(response => response.data),
        map(user => this.mapUserRole(user))
      );
  }

  deleteUser(id: string): Observable<void> {
    if (!this.checkAuth()) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.delete<BackendResponse<void>>(`${this.API_URL}/admin/users/${id}`)
      .pipe(map(response => response.data));
  }

  createUser(userData: Partial<User>): Observable<User> {
    if (!this.checkAuth()) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.post<BackendResponse<User>>(`${this.API_URL}/admin/users`, userData)
      .pipe(map(response => response.data));
  }

  getProfile(): Observable<User> {
    return this.http.get<BackendResponse<User>>(`${this.API_URL}/profile`)
      .pipe(map(response => response.data));
  }

  updateProfile(profileData: any): Observable<User> {
    return this.http.put<BackendResponse<User>>(`${this.API_URL}/profile-update`, profileData)
      .pipe(map(response => response.data));
  }

  updatePassword(passwordData: any): Observable<User> {
    return this.http.put<BackendResponse<User>>(`${this.API_URL}/profile-password-update`, passwordData)
      .pipe(map(response => response.data));
  }

  uploadAvatar(file: File): Observable<User> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<BackendResponse<User>>(`${this.API_URL}/avatar-upload`, formData)
      .pipe(map(response => response.data));
  }

  updateUserRole(id: string, role: UserRole): Observable<User> {
    return this.http.patch<BackendResponse<User>>(`${this.API_URL}/users/${id}/role`, { role })
      .pipe(map(response => response.data));
  }

  private mapUserRole(user: User): User {
    if (typeof user.role === 'string') {
      return {
        ...user,
        role: {
          _id: user.role,
          code: user.role
        }
      };
    }
    return user;
  }
} 