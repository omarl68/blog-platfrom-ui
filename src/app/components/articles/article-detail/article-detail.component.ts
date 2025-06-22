import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Article } from '../../../models/article.model';
import { ArticleService } from '../../../services/article.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-article-detail',
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.scss']
})
export class ArticleDetailComponent implements OnInit {
  article: Article | null = null;
  loading = false;
  canEdit = false;
  canDelete = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadArticle();
  }

  loadArticle(): void {
    const articleId = this.route.snapshot.paramMap.get('id');
    if (!articleId) {
      this.router.navigate(['/dashboard/articles']);
      return;
    }

    this.loading = true;
    this.articleService.getArticle(articleId).subscribe({
      next: (article) => {
        this.article = article;
        this.checkPermissions();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Failed to load article', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard/articles']);
      }
    });
  }

  private checkPermissions(): void {
    if (!this.article) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    // Admin can edit/delete any article
    if (this.authService.isAdmin()) {
      this.canEdit = true;
      this.canDelete = true;
      return;
    }

    // Author can edit/delete their own articles
    if (this.article.author === currentUser._id) {
      this.canEdit = true;
      this.canDelete = true;
      return;
    }

    // Editor can edit any article
    if (this.authService.isEditor()) {
      this.canEdit = true;
    }
  }

  editArticle(): void {
    if (!this.article?._id) return;
    this.router.navigate(['/dashboard/articles', this.article._id, 'edit']);
  }

  deleteArticle(): void {
    if (!this.article?._id) return;

    // TODO: Add confirmation dialog
    this.articleService.deleteArticle(this.article._id).subscribe({
      next: () => {
        this.snackBar.open('Article deleted successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard/articles']);
      },
      error: (error) => {
        this.snackBar.open('Failed to delete article', 'Close', { duration: 3000 });
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'published': return 'accent';
      case 'draft': return 'warn';
      case 'archived': return '';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/articles']);
  }
} 