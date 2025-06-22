import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Article, ArticleStatus } from '../../../models/article.model';
import { ArticleService } from '../../../services/article.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-article-list',
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.scss']
})
export class ArticleListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['title', 'authorName', 'status', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<Article>([]);
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private articleService: ArticleService,
    public authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadArticles();
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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

  canEditArticle(article: Article): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;
    return this.authService.canManageArticles() || 
           (this.authService.isWriter() && article.author === currentUser._id);
  }

  canDeleteArticle(article: Article): boolean {
    return this.authService.canManageArticles();
  }

  getStatusColor(status: ArticleStatus): string {
    switch (status) {
      case ArticleStatus.PUBLISHED: return 'accent';
      case ArticleStatus.DRAFT: return 'warn';
      default: return '';
    }
  }
} 