import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { TermsModalComponent } from '../terms-modal/terms-modal.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent, TermsModalComponent],
  template: `
    <app-navbar></app-navbar>
    
    <main class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Create Account</h1>
          <p>Join our community</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="register()" class="auth-form">
          <!-- Name Field -->
          <div class="form-group">
            <label for="name">Full Name</label>
            <input
              type="text"
              id="name"
              formControlName="name"
              placeholder="John Doe"
              class="form-input"
            />
            @if (isFieldInvalid('name')) {
              <span class="error-message">Name is required</span>
            }
          </div>

          <!-- Email Field -->
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              placeholder="your@liceo.edu.ph"
              class="form-input"
            />
            @if (isFieldInvalid('email')) {
              <span class="error-message">Valid email is required</span>
            }
          </div>

          <!-- Role Field -->
          <div class="form-group">
            <label for="role">User Type</label>
            <select
              id="role"
              formControlName="role"
              class="form-input"
              (change)="onRoleChange()"
            >
              <option value="">Select User Type</option>
              <option value="student">Student</option>
              <option value="employee">Employee</option>
            </select>
            @if (isFieldInvalid('role')) {
              <span class="error-message">User type is required</span>
            }
          </div>

          <!-- Department Field -->
          @if (registerForm.get('role')?.value) {
            <div class="form-group">
              <label for="department">Department</label>
              <select
                id="department"
                formControlName="department"
                class="form-input"
              >
                <option value="">Select Department</option>
                @for (dept of getDepartments(); track dept) {
                  <option [value]="dept">{{ dept }}</option>
                }
              </select>
              @if (isFieldInvalid('department')) {
                <span class="error-message">Department is required</span>
              }
            </div>
          }

          <!-- Password Field -->
          <div class="form-group">
            <label for="password">Password</label>
            <div class="password-wrapper">
              <input
                [type]="showPassword() ? 'text' : 'password'"
                id="password"
                formControlName="password"
                placeholder="Minimum 8 characters"
                class="form-input"
              />
              <button type="button" class="toggle-btn" (click)="showPassword.set(!showPassword())" [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'">
                @if (showPassword()) {
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            @if (isFieldInvalid('password')) {
              <span class="error-message">Password must be at least 8 characters</span>
            }
          </div>

          <!-- Confirm Password Field -->
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <div class="password-wrapper">
              <input
                [type]="showConfirmPassword() ? 'text' : 'password'"
                id="confirmPassword"
                formControlName="confirmPassword"
                placeholder="Re-enter your password"
                class="form-input"
              />
              <button type="button" class="toggle-btn" (click)="showConfirmPassword.set(!showConfirmPassword())" [attr.aria-label]="showConfirmPassword() ? 'Hide password' : 'Show password'">
                @if (showConfirmPassword()) {
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            @if (registerForm.get('confirmPassword')?.hasError('required') && registerForm.get('confirmPassword')?.touched) {
              <span class="error-message">Please confirm your password</span>
            }
            @if (registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched) {
              <span class="error-message">Passwords do not match</span>
            }
          </div>

          <!-- Terms & Conditions -->
          <div class="form-group checkbox terms-group">
            <input type="checkbox" id="terms" formControlName="terms" />
            <label for="terms" class="terms-label">
              By registering, you agree to the ICT Feedback &amp; Complaint Management System
              <button type="button" class="terms-link" (click)="openTermsModal()">Terms and Conditions</button>.
              The system ICT ensures confidentiality, secure handling of user complaints, and compliance with institutional policies.
            </label>
          </div>
          @if (registerForm.get('terms')?.invalid && registerForm.get('terms')?.touched) {
            <span class="error-message" style="margin-top: -1rem;">You must agree to the Terms and Conditions to register.</span>
          }

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="registerForm.invalid || isLoading()"
            class="btn btn-primary btn-large"
          >
            @if (isLoading()) {
              <span>Creating account...</span>
            } @else {
              <span>Create Account</span>
            }
          </button>

          @if (errorMessage()) {
            <div class="error-alert">
              {{ errorMessage() }}
            </div>
          }
        </form>

        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/login" class="link">Sign in</a></p>
        </div>
      </div>
    </main>

    <!-- Terms Modal -->
    @if (showTermsModal()) {
      <app-terms-modal (close)="showTermsModal.set(false)"></app-terms-modal>
    }
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
      width: 100%;

      &:focus {
        outline: none;
        border-color: #C41E3A;
        box-shadow: 0 0 0 3px rgba(196, 30, 58, 0.1);
      }
    }

    .password-wrapper {
      position: relative;
      display: flex;
      align-items: center;
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

    select.form-input {
      appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      background-size: 1.5em 1.5em;
      padding-right: 2.5rem !important;
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
      flex-shrink: 0;
      margin-top: 0.25rem;
    }

    .checkbox label {
      cursor: pointer;
      font-weight: normal;
      font-size: 0.95rem;
    }

    .terms-group {
      align-items: flex-start;
    }

    .terms-label {
      line-height: 1.5;
      color: #444;
    }

    .terms-link {
      background: none;
      border: none;
      padding: 0;
      color: #C41E3A;
      font-weight: 600;
      font-size: inherit;
      cursor: pointer;
      text-decoration: underline;

      &:hover {
        color: #8B0000;
      }
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
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  showTermsModal = signal(false);

  openTermsModal(): void {
    this.showTermsModal.set(true);
  }

  studentDepartments = [
    'Law',
    'Nursing',
    'Business/Management/Accountancy',
    'IT',
    'Engineering',
    'Arts & Sciences',
    'Education',
    'Allied Health Sciences',
    'Conservatory of Music, Arts, and Dance'
  ];

  employeeDepartments = [
    'Administration',
    'Finance',
    'Human Resources',
    'Academic Affairs',
    'Student Services',
    'Facilities',
    'IT Support',
    'Library Services',
    'Other'
  ];

  constructor() {
    this.registerForm = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        role: ['', Validators.required],
        department: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
        terms: [false, Validators.requiredTrue]
      },
      { validators: this.passwordMatchValidator.bind(this) }
    );
  }

  getDepartments(): string[] {
    const role = this.registerForm.get('role')?.value;
    return role === 'student' ? this.studentDepartments : this.employeeDepartments;
  }

  onRoleChange(): void {
    this.registerForm.patchValue({ department: '' });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password && confirmPassword && password !== confirmPassword
      ? { passwordMismatch: true }
      : null;
  }

  register(): void {
    if (this.registerForm.invalid) {
      this.errorMessage.set('Please fill in all required fields correctly.');
      return;
    }

    this.isLoading.set(true);
    const { name, email, password, role, department } = this.registerForm.value;

    this.authService
      .register({
        email,
        password,
        full_name: name,
        usertype: role,
        department,
        role: 'user',
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/dashboard']);
        },
        error: (err: Error) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message || 'Registration failed.');
          console.error('Registration error:', err);
        }
      });
  }
}
