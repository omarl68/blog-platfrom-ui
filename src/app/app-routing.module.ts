import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HomeComponent } from './components/dashboard/home/home.component';
import { ArticleListComponent } from './components/articles/article-list/article-list.component';
import { ArticleFormComponent } from './components/articles/article-form/article-form.component';
import { ArticleDetailComponent } from './components/articles/article-detail/article-detail.component';
import { UserManagementComponent } from './components/users/user-management/user-management.component';
import { AdminArticleManagementComponent } from './components/articles/admin-article-management/admin-article-management.component';
import { AdminUserManagementComponent } from './components/users/admin-user-management/admin-user-management.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'articles/new', component: ArticleFormComponent },
      { path: 'articles/:id/edit', component: ArticleFormComponent },
      { path: 'articles/:id', component: ArticleDetailComponent },
      { path: 'articles', component: ArticleListComponent },
      { path: 'users', component: UserManagementComponent },
      { path: 'admin/articles/new', component: ArticleFormComponent },
      { path: 'admin/articles/:id/edit', component: ArticleFormComponent },
      { path: 'admin/articles/:id', component: ArticleDetailComponent },
      { path: 'admin/articles', component: AdminArticleManagementComponent },
      { path: 'admin/users/new', component: UserManagementComponent },
      { path: 'admin/users/:id/edit', component: UserManagementComponent },
      { path: 'admin/users/:id', component: UserManagementComponent },
      { path: 'admin/users', component: AdminUserManagementComponent },
    ]
  },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
