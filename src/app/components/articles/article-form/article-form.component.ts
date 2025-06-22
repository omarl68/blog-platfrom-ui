import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Article, CreateArticleRequest, UpdateArticleRequest, ArticleStatus } from '../../../models/article.model';
import { ArticleService } from '../../../services/article.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-article-form',
  templateUrl: './article-form.component.html',
  styleUrls: ['./article-form.component.scss']
})
export class ArticleFormComponent implements OnInit {
  articleForm: FormGroup;
  loading = false;
  isEditMode = false;
  articleId: string | null = null;
  currentArticle: Article | null = null;
  selectedImage: File | null = null;

  constructor(
    private fb: FormBuilder,
    private articleService: ArticleService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.articleForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      tags: [''],
      status: [ArticleStatus.DRAFT]
    });
  }

  ngOnInit(): void {
    this.articleId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.articleId;

    if (this.isEditMode && this.articleId) {
      this.loadArticle();
    }
  }

  loadArticle(): void {
    if (!this.articleId) return;

    this.loading = true;
    this.articleService.getArticle(this.articleId).subscribe({
      next: (article) => {
        this.currentArticle = article;
        this.populateForm(article);
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Failed to load article', 'Close', { duration: 3000 });
        this.navigateToArticleList();
      }
    });
  }

  populateForm(article: Article): void {
    this.articleForm.patchValue({
      title: article.title,
      content: article.content,
      tags: article.tags?.join(', ') || '',
      status: article.status
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
    }
  }

  onSubmit(): void {
    if (this.articleForm.valid) {
      this.loading = true;
      const formValue = this.articleForm.value;
      
      // Convert tags string to array
      const tags = formValue.tags ? formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [];

      if (this.isEditMode && this.articleId) {
        const updateData: UpdateArticleRequest = {
          title: formValue.title,
          content: formValue.content,
          tags: tags,
          status: formValue.status
        };

        if (this.selectedImage) {
          updateData.image = this.selectedImage;
        }

        this.articleService.updateArticle(this.articleId, updateData).subscribe({
          next: (article) => {
            this.loading = false;
            this.snackBar.open('Article updated successfully', 'Close', { duration: 3000 });
            this.navigateToArticleList();
          },
          error: (error) => {
            this.loading = false;
            this.snackBar.open('Failed to update article', 'Close', { duration: 3000 });
          }
        });
      } else {
        const createData: CreateArticleRequest = {
          title: formValue.title,
          content: formValue.content,
          tags: tags,
          status: formValue.status
        };

        if (this.selectedImage) {
          createData.image = this.selectedImage;
        }

        this.articleService.createArticle(createData).subscribe({
          next: (article) => {
            this.loading = false;
            this.snackBar.open('Article created successfully', 'Close', { duration: 3000 });
            this.navigateToArticleList();
          },
          error: (error) => {
            this.loading = false;
            this.snackBar.open('Failed to create article', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }

  onCancel(): void {
    this.navigateToArticleList();
  }

  private navigateToArticleList(): void {
    // Check if we're in admin context
    const isAdminRoute = this.router.url.includes('/admin/');
    if (isAdminRoute) {
      this.router.navigate(['/dashboard/admin/articles']);
    } else {
      this.router.navigate(['/dashboard/articles']);
    }
  }

  canPublish(): boolean {
    return this.authService.canManageArticles();
  }

  getStatusOptions(): { value: ArticleStatus; label: string }[] {
    const options = [
      { value: ArticleStatus.DRAFT, label: 'Draft' }
    ];

    if (this.canPublish()) {
      options.push({ value: ArticleStatus.PUBLISHED, label: 'Published' });
    }

    return options;
  }
} 