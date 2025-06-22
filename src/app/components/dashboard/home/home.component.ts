import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ArticleService } from '../../../services/article.service';
import { User, UserRole } from '../../../models/user.model';
import { Article } from '../../../models/article.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  currentUser: User | null = null;
  recentArticles: Article[] = [];
  loading = false;
  private articlesLoaded = false;

  constructor(
    private authService: AuthService,
    private articleService: ArticleService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      // Only load articles when user is authenticated and articles haven't been loaded
      if (user && this.authService.isAuthenticated() && !this.articlesLoaded) {
        this.loadRecentArticles();
      }
    });
  }

  loadRecentArticles(): void {
    // Check if user is authenticated before making API call
    if (!this.authService.hasToken()) {
      console.warn('User not authenticated, skipping articles load');
      return;
    }

    if (this.articlesLoaded) {
      console.log('Articles already loaded, skipping');
      return;
    }

    this.loading = true;
    this.articleService.getArticles().subscribe({
      next: (articles) => {
        this.recentArticles = articles.slice(0, 5); // Get latest 5 articles
        this.loading = false;
        this.articlesLoaded = true;
      },
      error: (error) => {
        console.error('Failed to load articles:', error);
        this.loading = false;
        // Don't set articlesLoaded to true on error, so we can retry
      }
    });
  }

  get userRoleLabel(): string {
    if (!this.currentUser) return '';
    
    // Handle role as string (role ID) or object
    let roleCode: string;
    if (typeof this.currentUser.role === 'string') {
      // If role is a string (ID), we need to determine the role from the user data
      // For now, we'll use a default or check if it's admin
      roleCode = 'reader'; // Default fallback
    } else {
      roleCode = this.currentUser.role?.code || 'reader';
    }
    
    switch (roleCode) {
      case UserRole.ADMIN: return 'Administrator';
      case UserRole.EDITOR: return 'Editor';
      case UserRole.WRITER: return 'Writer';
      case UserRole.READER: return 'Reader';
      default: return 'User';
    }
  }

  get canManageUsers(): boolean {
    return this.authService.canManageUsers();
  }

  get canManageArticles(): boolean {
    return this.authService.canManageArticles();
  }

  get canWriteArticles(): boolean {
    return this.authService.canWriteArticles();
  }

  get myArticlesCount(): number {
    if (!this.currentUser) return 0;
    return this.recentArticles.filter(a => a.author === this.currentUser?._id).length;
  }
} 