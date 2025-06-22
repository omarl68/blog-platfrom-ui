import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginData = {
    email: '',
    password: ''
  };
  
  loading = false;
  emailError = '';
  passwordError = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onSubmit(): void {
    this.clearErrors();
    
    if (!this.validateForm()) {
      return;
    }
    
    this.loading = true;
    console.log('LoginComponent: Attempting login with:', this.loginData);
    
    this.authService.login(this.loginData.email, this.loginData.password).subscribe({
      next: (user) => {
        console.log('LoginComponent: Login successful, user:', user);
        this.loading = false;
        this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('LoginComponent: Login failed:', error);
        console.error('LoginComponent: Error response:', error.error);
        this.loading = false;
        const message = error.error?.message || 'Login failed';
        this.snackBar.open(message, 'Close', { duration: 3000 });
      }
    });
  }

  private validateForm(): boolean {
    let isValid = true;
    
    // Validate email
    if (!this.loginData.email) {
      this.emailError = 'Email is required';
      isValid = false;
    } else if (!this.isValidEmail(this.loginData.email)) {
      this.emailError = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Validate password
    if (!this.loginData.password) {
      this.passwordError = 'Password is required';
      isValid = false;
    } else if (this.loginData.password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    return isValid;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private clearErrors(): void {
    this.emailError = '';
    this.passwordError = '';
  }
} 