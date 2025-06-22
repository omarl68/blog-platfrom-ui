import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private router: Router
  ) {}

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.getToken();

    // Start with the original request
    let authReq = request.clone();

    if (token) {
      authReq = authReq.clone({
        headers: authReq.headers.set('Authorization', `Bearer ${token}`)
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          if (request.url.includes('/login') || request.url.includes('/register')) {
            // For login/register, just propagate the error
            return throwError(() => error);
          }
          return this.handle401Error(authReq, next);
        }
        
        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      // Try to refresh the token
      return this.refreshToken().pipe(
        switchMap((success: boolean) => {
          this.isRefreshing = false;
          if (success) {
            this.refreshTokenSubject.next(success);
            const newToken = this.getToken();
            if (newToken) {
              request = request.clone({
                headers: request.headers.set('Authorization', `Bearer ${newToken}`)
              });
            }
            return next.handle(request);
          } else {
            this.clearAuth();
            return throwError(() => new Error('Token refresh failed'));
          }
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.clearAuth();
          return throwError(() => err);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(result => result !== null),
        take(1),
        switchMap(() => {
          const newToken = this.getToken();
          if (newToken) {
            request = request.clone({
              headers: request.headers.set('Authorization', `Bearer ${newToken}`)
            });
          }
          return next.handle(request);
        })
      );
    }
  }

  private refreshToken(): Observable<boolean> {
    // Make a simple HTTP request to refresh the token
    // The HttpOnly cookie will be sent automatically
    return new Observable(observer => {
      fetch('http://localhost:3001/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem('token', data.data.accessToken);
          localStorage.setItem('currentUser', JSON.stringify(data.data.user));
          observer.next(true);
        } else {
          observer.next(false);
        }
        observer.complete();
      })
      .catch(error => {
        observer.next(false);
        observer.complete();
      });
    });
  }
} 