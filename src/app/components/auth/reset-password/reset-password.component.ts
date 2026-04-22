import { Component, signal, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Reset Password</h1>
          <p>Enter your new password below</p>
        </div>

        @if (tokenMissing()) {
          <div class="error-alert" style="margin-bottom: 1.5rem;">
            Invalid or missing reset token. Please request a new password reset link.
          </div>
          <div class="auth-footer">
            <p><a routerLink="/forgot-password" class="link">Request new reset link</a></p>
          </div>
        } @else if (successMessage()) {
          <div class="success-alert">
            {{ successMessage() }}
          </div>
          <div class="auth-footer" style="margin-top: 1.5rem;">
            <p><a routerLink="/login" class="link">Back to Sign In</a></p>
          </div>
        } @else {
          <form [formGroup]="resetForm" (ngSubmit)="submit()" class="auth-form">
            <!-- New Password -->
            <div class="form-group">
              <label for="newPassword">New Password</label>
              <div class="password-wrapper">
                <input
                  [type]="showNew() ? 'text' : 'password'"
                  id="newPassword"
                  formControlName="newPassword"
                  placeholder="Minimum 8 characters"
                  class="form-input"
                />
                <button type="button" class="toggle-btn" (click)="showNew.set(!showNew())" [attr.aria-label]="showNew() ? 'Hide password' : 'Show password'">
                  @if (showNew()) {
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              @if (isFieldInvalid('newPassword')) {
                <span class="error-message">Password must be at least 8 characters</span>
              }
            </div>

            <!-- Confirm Password -->
            <div class="form-group">
              <label for="confirmPassword">Confirm New Password</label>
              <div class="password-wrapper">
                <input
                  [type]="showConfirm() ? 'text' : 'password'"
                  id="confirmPassword"
                  formControlName="confirmPassword"
                  placeholder="Re-enter your new password"
                  class="form-input"
                />
                <button type="button" class="toggle-btn" (click)="showConfirm.set(!showConfirm())" [attr.aria-label]="showConfirm() ? 'Hide password' : 'Show password'">
                  @if (showConfirm()) {
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              @if (resetForm.get('confirmPassword')?.hasError('required') && resetForm.get('confirmPassword')?.touched) {
                <span class="error-message">Please confirm your new password</span>
              }
              @if (resetForm.hasError('passwordMismatch') && resetForm.get('confirmPassword')?.touched) {
                <span class="error-message">Passwords do not match</span>
              }
            </div>

            <!-- Submit -->
            <button
              type="submit"
              [disabled]="resetForm.invalid || isLoading()"
              class="btn btn-primary btn-large"
            >
              @if (isLoading()) {
                <span>Resetting...</span>
              } @else {
                <span>Reset Password</span>
              }
            </button>

            @if (errorMessage()) {
              <div class="error-alert">
                {{ errorMessage() }}
              </div>
            }
          </form>

          <div class="auth-footer">
            <p><a routerLink="/login" class="link">Back to Sign In</a></p>
          </div>
        }
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

    .password-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .form-input {
      padding: 0.75rem 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 0.5rem;
      font-size: 1rem;
      transition: all 0.3s ease;
      width: 100%;

      &:focus {
        outline: none;
        border-color: #C41E3A;
        box-shadow: 0 0 0 3px rgba(196, 30, 58, 0.1);
      }
    }

    .password-wrapper .form-input {
      padding-right: 3rem;
    }

    .toggle-btn {
      position: absolute;
      right: 0.75rem;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      color: #888;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s ease;

      &:hover {
        color: #C41E3A;
      }

      svg {
        width: 1.2rem;
        height: 1.2rem;
      }
    }

    .error-message {
      color: #e74c3c;
      font-size: 0.85rem;
      font-weight: 500;
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

    .success-alert {
      background: #e8f5e9;
      border-left: 4px solid #4caf50;
      padding: 1rem;
      border-radius: 0.5rem;
      color: #2e7d32;
      font-weight: 500;
    }

    .auth-footer {
      text-align: center;
      margin-top: 2rem;
      border-top: 1px solid #e0e0e0;
      padding-top: 1.5rem;
    }

    .auth-footer p {
      margin: 0;
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
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  resetForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  tokenMissing = signal(false);
  showNew = signal(false);
  showConfirm = signal(false);

  private token = '';

  constructor() {
    this.resetForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.tokenMissing.set(true);
    } else {
      this.token = token;
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.resetForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const newPassword = group.get('newPassword')?.value as string;
    const confirmPassword = group.get('confirmPassword')?.value as string;
    return newPassword && confirmPassword && newPassword !== confirmPassword
      ? { passwordMismatch: true }
      : null;
  }

  submit(): void {
    if (this.resetForm.invalid || !this.token) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    const { newPassword } = this.resetForm.value as { newPassword: string };

    this.authService.resetPassword(this.token, newPassword).subscribe({
      next: (res: { message: string }) => {
        this.isLoading.set(false);
        this.successMessage.set(res.message || 'Your password has been reset successfully. You can now sign in.');
        setTimeout(() => void this.router.navigate(['/login']), 3000);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Failed to reset password. The link may have expired or already been used.');
      }
    });
  }
}
