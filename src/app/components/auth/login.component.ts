import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    
    <main class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="login()" class="auth-form">
          <!-- Email Field -->
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              placeholder="your@email.com"
              class="form-input"
            />
            @if (isFieldInvalid('email')) {
              <span class="error-message">Valid email is required</span>
            }
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              placeholder="Enter your password"
              class="form-input"
            />
            @if (isFieldInvalid('password')) {
              <span class="error-message">Password is required</span>
            }
          </div>

          <!-- Remember Me -->
          <div class="form-group checkbox">
            <input type="checkbox" id="remember" />
            <label for="remember">Remember me</label>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="loginForm.invalid || isLoading()"
            class="btn btn-primary btn-large"
          >
            @if (isLoading()) {
              <span>Signing in...</span>
            } @else {
              <span>Sign In</span>
            }
          </button>

          @if (errorMessage()) {
            <div class="error-alert">
              {{ errorMessage() }}
            </div>
          }
        </form>

          <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/register" class="link">Sign up</a></p>
          <a routerLink="/forgot-password" class="forgot-password">Forgot password?</a>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .auth-container {
      background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
      min-height: calc(100vh - 70px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .auth-card {
      background: white;
      padding: 3rem 2rem;
      border-radius: 1rem;
      box-shadow: 0 8px 24px rgba(139, 0, 0, 0.1);
      width: 100%;
      max-width: 450px;
      animation: slideInUp 0.6s ease-out;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-header h1 {
      font-size: 2rem;
      color: #8B0000;
      margin: 0 0 0.5rem 0;
    }

    .auth-header p {
      color: #666;
      margin: 0;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 600;
      color: #333;
    }

    .form-input {
      padding: 0.75rem 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 0.5rem;
      font-size: 1rem;
      transition: all 0.3s ease;

      &:focus {
        outline: none;
        border-color: #C41E3A;
        box-shadow: 0 0 0 3px rgba(196, 30, 58, 0.1);
      }
    }

    .error-message {
      color: #e74c3c;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .checkbox {
      flex-direction: row;
      gap: 0.5rem;
    }

    .checkbox input {
      width: 1.1rem;
      height: 1.1rem;
      cursor: pointer;
      accent-color: #C41E3A;
    }

    .checkbox label {
      cursor: pointer;
      font-weight: normal;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .btn-primary {
      background: linear-gradient(135deg, #8B0000 0%, #C41E3A 100%);
      color: white;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(139, 0, 0, 0.3);
      }
    }

    .btn-large {
      width: 100%;
      padding: 1rem;
    }

    .error-alert {
      background: #fce4e6;
      border-left: 4px solid #e74c3c;
      padding: 1rem;
      border-radius: 0.5rem;
      color: #c0392b;
      font-weight: 500;
    }

    .auth-footer {
      text-align: center;
      margin-top: 2rem;
      border-top: 1px solid #e0e0e0;
      padding-top: 1.5rem;
    }

    .auth-footer p {
      margin: 0 0 1rem 0;
      color: #666;
    }

    .link {
      color: #C41E3A;
      text-decoration: none;
      font-weight: 600;

      &:hover {
        text-decoration: underline;
      }
    }

    .forgot-password {
      display: inline-block;
      margin-top: 0.5rem;
      color: #8B0000;
      text-decoration: none;
      font-size: 0.9rem;

      &:hover {
        text-decoration: underline;
      }
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 480px) {
      .auth-card {
        padding: 2rem 1.5rem;
      }

      .auth-header h1 {
        font-size: 1.5rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.errorMessage.set('Please fill in all required fields.');
      return;
    }

    this.isLoading.set(true);
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const fallbackRoute = response.user.role === 'admin' ? '/admin' : '/dashboard';
        void this.router.navigateByUrl(returnUrl || fallbackRoute);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Invalid email or password. Please try again.');
        console.error('Login error:', err);
      }
    });
  }
}
