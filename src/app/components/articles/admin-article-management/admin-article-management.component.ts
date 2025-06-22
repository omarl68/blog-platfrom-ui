import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { Article, ArticleStatus } from '../../../models/article.model';
import { ArticleService } from '../../../services/article.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-article-management',
  templateUrl: './admin-article-management.component.html',
  styleUrls: ['./admin-article-management.component.scss']
})
export class AdminArticleManagementComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['title', 'author', 'status', 'createdAt', 'updatedAt', 'actions'];
  dataSource = new MatTableDataSource<Article>([]);
  loading = false;
  isViewMode = false;
  isEditMode = false;
  selectedArticle: Article | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private articleService: ArticleService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Wait for user to be authenticated before processing
    this.authService.currentUser$.subscribe(user => {
      if (user && this.authService.isAdmin()) {
        // Check if we're in view/edit mode based on route
        this.route.params.subscribe(params => {
          const articleId = params['id'];
          if (articleId) {
            this.isViewMode = !this.router.url.includes('/edit');
            this.isEditMode = this.router.url.includes('/edit');
            if (this.isViewMode || this.isEditMode) {
              this.loadArticle(articleId);
            }
          } else {
            // Only load articles if we're not in view/edit mode
            if (!this.isViewMode && !this.isEditMode) {
              this.loadArticles();
            }
          }
        });
      }
    });
  }

  ngAfterViewInit() {
    if (!this.isViewMode && !this.isEditMode) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  loadArticles(): void {
    this.loading = true;
    this.articleService.getArticles().subscribe({
      next: (articles) => {
        this.dataSource.data = articles;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Failed to load articles', 'Close', { duration: 3000 });
      }
    });
  }

  loadArticle(articleId: string): void {
    this.loading = true;
    this.articleService.getArticle(articleId).subscribe({
      next: (article) => {
        this.selectedArticle = article;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Failed to load article', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard/articles']);
      }
    });
  }

  viewArticle(articleId: string | undefined): void {
    if (!articleId) return;
    this.router.navigate(['/dashboard/articles', articleId]);
  }

  editArticle(articleId: string | undefined): void {
    if (!articleId) return;
    this.router.navigate(['/dashboard/articles', articleId, 'edit']);
  }

  deleteArticle(articleId: string | undefined): void {
    if (!articleId) return;
    
    // TODO: Add confirmation dialog
    this.articleService.deleteArticle(articleId).subscribe({
      next: () => {
        this.snackBar.open('Article deleted successfully', 'Close', { duration: 3000 });
        this.loadArticles();
      },
      error: (error) => {
        this.snackBar.open('Failed to delete article', 'Close', { duration: 3000 });
      }
    });
  }

  createArticle(): void {
    this.router.navigate(['/dashboard/articles/new']);
  }

  backToList(): void {
    this.router.navigate(['/dashboard/articles']);
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

  // Admin can do everything
  canEditArticle(article: Article): boolean {
    return true;
  }

  canDeleteArticle(article: Article): boolean {
    return true;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
} 