import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, throwError, catchError } from 'rxjs';
import { Article, CreateArticleRequest, UpdateArticleRequest } from '../models/article.model';
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
export class ArticleService {
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

  getArticles(): Observable<Article[]> {
    if (!this.checkAuth()) {
      return throwError(() => new Error('User not authenticated'));
    }

    const endpoint =  `${this.API_URL}/articles`;
    
    return this.http.get<PaginatedResponse<Article>>(endpoint)
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
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  getArticle(id: string): Observable<Article> {
    if (!this.checkAuth()) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<BackendResponse<Article>>(`${this.API_URL}/articles/${id}`)
      .pipe(map(response => response.data));
  }

  createArticle(article: CreateArticleRequest): Observable<Article> {
    if (!this.checkAuth()) {
      return throwError(() => new Error('User not authenticated'));
    }

    const formData = new FormData();
    formData.append('title', article.title);
    formData.append('content', article.content);
    if (article.tags) {
      article.tags.forEach(tag => formData.append('tags[]', tag));
    }
    if (article.status) {
      formData.append('status', article.status);
    }
    if (article.image) {
      formData.append('file', article.image);
    }
    
    return this.http.post<BackendResponse<Article>>(`${this.API_URL}/articles`, formData)
      .pipe(
        map(response => response.data),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  updateArticle(id: string, article: UpdateArticleRequest): Observable<Article> {
    if (!this.checkAuth()) {
      return throwError(() => new Error('User not authenticated'));
    }

    const formData = new FormData();
    if (article.title) formData.append('title', article.title);
    if (article.content) formData.append('content', article.content);
    if (article.tags) {
      article.tags.forEach(tag => formData.append('tags[]', tag));
    }
    if (article.status) formData.append('status', article.status);
    if (article.image) {
      formData.append('file', article.image);
    }
    
    return this.http.put<BackendResponse<Article>>(`${this.API_URL}/articles/${id}`, formData)
      .pipe(map(response => response.data));
  }

  deleteArticle(id: string): Observable<void> {
    if (!this.checkAuth()) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.delete<BackendResponse<void>>(`${this.API_URL}/articles/${id}`)
      .pipe(map(response => response.data));
  }

  getMyArticles(): Observable<Article[]> {
    if (!this.checkAuth()) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<BackendResponse<Article[]>>(`${this.API_URL}/articles/my-articles`)
      .pipe(map(response => response.data));
  }

  publishArticle(id: string): Observable<Article> {
    if (!this.checkAuth()) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.patch<BackendResponse<Article>>(`${this.API_URL}/articles/${id}/publish`, {})
      .pipe(map(response => response.data));
  }

  archiveArticle(id: string): Observable<Article> {
    if (!this.checkAuth()) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.patch<BackendResponse<Article>>(`${this.API_URL}/articles/${id}/archive`, {})
      .pipe(map(response => response.data));
  }

  shareArticle(id: string): Observable<Article> {
    if (!this.checkAuth()) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.put<BackendResponse<Article>>(`${this.API_URL}/articles/${id}/share`, {})
      .pipe(map(response => response.data));
  }
} 