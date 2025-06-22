import { Component, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User, UserRole } from '../../models/user.model';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  currentUser: User | null = null;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  closeMobileMenu(): void {
    this.isHandset$.subscribe(isHandset => {
      if (isHandset) {
        this.sidenav.close();
      }
    }).unsubscribe();
  }

  getPageTitle(): string {
    const currentUrl = this.router.url;
    if (currentUrl.includes('/articles/new')) {
      return 'New Article';
    } else if (currentUrl.includes('/dashboard/admin/users')) {
      return 'User Management';
    } else if (currentUrl.includes('/dashboard/admin/articles')) {
      return 'Article Management';
    } else if (currentUrl.includes('/articles')) {
      return 'Articles';
    } else {
      return 'Dashboard';
    }
  }

  getInitials(): string {
    if (!this.currentUser?.firstName && !this.currentUser?.lastName) return 'U';
    const firstName = this.currentUser?.firstName || '';
    const lastName = this.currentUser?.lastName || '';
    return (firstName + ' ' + lastName)
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getRoleLabel(role: any): string {
    if (!role) return 'Unknown';
    
    // Handle role as string or object
    let roleCode: string;
    if (typeof role === 'string') {
      roleCode = role;
    } else {
      roleCode = role.code || 'Unknown';
    }
    
    switch (roleCode) {
      case 'admin': return 'Administrator';
      case 'editor': return 'Editor';
      case 'writer': return 'Writer';
      case 'reader': return 'Reader';
      default: return roleCode;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get isEditor(): boolean {
    return this.authService.isEditor();
  }

  get isWriter(): boolean {
    return this.authService.isWriter();
  }

  get isReader(): boolean {
    return this.authService.isReader();
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
} 