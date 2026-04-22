import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../navbar/navbar.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, NavbarComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPassword {
  forgotPasswordForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  isPasswordChanged = false;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.forgotPasswordForm = this.fb.group({
      emailOrUsername: ['', [Validators.required]],
      fullname: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.isSubmitting || this.isPasswordChanged) {
      return;
    }

    const emailOrUsername = String(this.forgotPasswordForm.value.emailOrUsername ?? '').trim();
    const fullname = String(this.forgotPasswordForm.value.fullname ?? '').trim();
    const newPassword = String(this.forgotPasswordForm.value.newPassword ?? '');
    const confirmPassword = String(this.forgotPasswordForm.value.confirmPassword ?? '');

    if (!emailOrUsername) {
      this.errorMessage = 'Email/Username is required.';
      return;
    }

    if (!fullname) {
      this.errorMessage = 'Fullname is required.';
      return;
    }

    if (!newPassword || !confirmPassword) {
      this.errorMessage = 'New password and confirm password are required.';
      return;
    }

    if (newPassword !== confirmPassword) {
      this.errorMessage = 'New password and confirm password do not match.';
      return;
    }

    if (newPassword.length < 8) {
      this.errorMessage = 'New password must be at least 8 characters.';
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';
    this.isSubmitting = true;

    this.authService.forgotPasswordDirect({
      emailOrUsername,
      fullname,
      newPassword,
      confirmPassword,
    }).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = response.message;
        this.isPasswordChanged = true;
      },
      error: (error: Error) => {
        this.isSubmitting = false;
        this.errorMessage = error.message || 'Unable to process password reset request.';
      },
    });
  }

  backToLogin(): void {
    this.router.navigate(['/login']);
  }
}
