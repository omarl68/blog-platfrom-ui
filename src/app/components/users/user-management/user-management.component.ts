import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User, UserRole } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  displayedColumns: string[] = ['firstName', 'lastName', 'email', 'role', 'isEmailVerified', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  userRoles = [
    { value: UserRole.ADMIN, label: 'Administrator' },
    { value: UserRole.EDITOR, label: 'Editor' },
    { value: UserRole.WRITER, label: 'Writer' },
    { value: UserRole.READER, label: 'Reader' }
  ];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Wait for user to be authenticated before loading users
    this.authService.currentUser$.subscribe(user => {
      if (user && this.authService.isAdmin()) {
        this.loadUsers();
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (users: User[]) => {
        this.dataSource.data = users;
        this.loading = false;
      },
      error: (error: any) => {
        this.loading = false;
        this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  updateUserRole(user: User, newRole: UserRole): void {
    if (!user._id) return;

    this.userService.updateUser(user._id, { role: newRole }).subscribe({
      next: (updatedUser: User) => {
        // Update the user in the table
        const index = this.dataSource.data.findIndex(u => u._id === user._id);
        if (index !== -1) {
          this.dataSource.data[index] = updatedUser;
          this.dataSource._updateChangeSubscription();
        }
        this.snackBar.open('User role updated successfully', 'Close', { duration: 3000 });
      },
      error: (error: any) => {
        this.snackBar.open('Failed to update user role', 'Close', { duration: 3000 });
      }
    });
  }

  deleteUser(user: User): void {
    if (!user._id) return;

    // TODO: Add confirmation dialog
    this.userService.deleteUser(user._id).subscribe({
      next: () => {
        this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: (error: any) => {
        this.snackBar.open('Failed to delete user', 'Close', { duration: 3000 });
      }
    });
  }

  canDeleteUser(user: User): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;
    
    // Cannot delete yourself
    if (user._id === currentUser._id) return false;
    
    // Only admins can delete users
    return this.authService.isAdmin();
  }

  canUpdateUserRole(user: User): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;
    
    // Cannot change your own role
    if (user._id === currentUser._id) return false;
    
    // Only admins can change user roles
    return this.authService.isAdmin();
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
    
    const roleOption = this.userRoles.find(r => r.value === roleCode);
    return roleOption ? roleOption.label : roleCode;
  }

  getRoleColor(role: any): string {
    if (!role) return '';
    
    // Handle role as string or object
    let roleCode: string;
    if (typeof role === 'string') {
      roleCode = role;
    } else {
      roleCode = role.code || '';
    }
    
    switch (roleCode) {
      case UserRole.ADMIN: return 'warn';
      case UserRole.EDITOR: return 'accent';
      case UserRole.WRITER: return 'primary';
      case UserRole.READER: return '';
      default: return '';
    }
  }

  getRoleValue(role: any): string {
    if (!role) return '';
    if (typeof role === 'string') {
      return role;
    }
    return role.code || '';
  }
} 