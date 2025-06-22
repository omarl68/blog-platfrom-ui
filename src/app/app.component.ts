import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'article-management-app';
  isAuthenticated = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.handleNavigation();
    });
  }

  private handleNavigation(): void {
    const currentUrl = this.router.url;
    const hasToken = this.authService.hasToken();

    if (hasToken) {
      if (currentUrl === '/login' || currentUrl === '/signup' || currentUrl === '/') {
        this.router.navigate(['/dashboard']);
      }
    } else {
      if (currentUrl !== '/login' && currentUrl !== '/signup') {
        this.router.navigate(['/login']);
      }
    }
  }
}
