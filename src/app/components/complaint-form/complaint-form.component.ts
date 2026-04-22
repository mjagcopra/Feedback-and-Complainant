import { Component, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ComplaintService } from '../../services/complaint.service';
import { AuthService } from '../../services/auth.service';
import { CategoryService, Category } from '../../services/category.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-complaint-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    
    <main class="complaint-form-container">
      <div class="form-wrapper">
        <div class="form-header">
          <h1>Submit Your Complaint</h1>
          <p>Help us improve by sharing your feedback</p>
        </div>

        @if (submitted()) {
          <div class="success-message">
            <div class="success-icon">✓</div>
            <h2>Thank You!</h2>
            <p>Your complaint has been submitted successfully.</p>
            <p class="reference-id">Reference ID: {{ referenceId() }}</p>
            <button class="btn btn-primary" (click)="resetForm()">Submit Another</button>
            <button class="btn btn-secondary" (click)="goHome()">Go to Dashboard</button>
          </div>
        } @else {
          <form [formGroup]="complaintForm" (ngSubmit)="submitComplaint()" class="form">
            <div class="form-group">
              <label for="name">Your Name</label>
              <input
                type="text"
                id="name"
                formControlName="name"
                placeholder="Enter your name"
                class="form-input"
                readonly
              />
              @if (isFieldInvalid('name')) {
                <span class="error-message">Name is required</span>
              }
            </div>

            <div class="form-group">
              <label for="email">Email Address</label>
              <input
                type="email"
                id="email"
                formControlName="email"
                placeholder="Enter your email"
                class="form-input"
                readonly
              />
              @if (isFieldInvalid('email')) {
                <span class="error-message">Valid email is required</span>
              }
            </div>

            <!-- Category Field -->
            <div class="form-group">
              <label for="category">Category</label>
              <select
                id="category"
                formControlName="category"
                class="form-input"
                (change)="onCategoryChange()"
              >
                <option value="">Select a category</option>
                @for (cat of categories(); track cat.id) {
                  @if (cat.name !== 'Other') {
                    <option [value]="cat.id">{{ cat.name }}</option>
                  }
                }
                <option value="others">Others</option>
              </select>
              @if (isFieldInvalid('category')) {
                <span class="error-message">Please select a category</span>
              }
            </div>

            <!-- Specific Area Field (only show if Others is selected) -->
            @if (showDepartmentField()) {
              <div class="form-group">
                <label for="department">Specific Problem</label>
                <input
                  type="text"
                  id="department"
                  formControlName="department"
                  placeholder="Enter specific problem"
                  class="form-input"
                />
                @if (isFieldInvalid('department')) {
                  <span class="error-message">Specific Problem is required</span>
                }
              </div>
            }

            <!-- Message Field -->
            <div class="form-group">
              <label for="message">Your Message</label>
              <textarea
                id="message"
                formControlName="message"
                placeholder="Describe your complaint or feedback..."
                rows="6"
                class="form-input"
              ></textarea>
              @if (isFieldInvalid('message')) {
                <span class="error-message">Message is required (minimum 10 characters)</span>
              }
              <span class="char-count">{{ complaintForm.get('message')?.value?.length || 0 }}/500</span>
            </div>

            <!-- Submit Button -->
            <div class="form-actions">
              <button
                type="submit"
                [disabled]="complaintForm.invalid || isSubmitting()"
                class="btn btn-primary btn-large"
              >
                @if (isSubmitting()) {
                  <span>Submitting...</span>
                } @else {
                  <span>Submit Complaint</span>
                }
              </button>
              <button type="reset" class="btn btn-secondary" (click)="resetForm()">
                Clear Form
              </button>
            </div>

            @if (errorMessage()) {
              <div class="error-alert">
                {{ errorMessage() }}
              </div>
            }
          </form>
        }
      </div>
    </main>
  `,
  styles: [`
    .complaint-form-container {
      background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
      min-height: 100vh;
      padding: 40px 2rem;
    }

    .form-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      padding: 3rem;
      border-radius: 1rem;
      box-shadow: 0 8px 24px rgba(139, 0, 0, 0.1);
      animation: slideInUp 0.6s ease-out;
    }

    .form-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .form-header h1 {
      font-size: 2rem;
      color: #8B0000;
      margin: 0 0 0.5rem 0;
    }

    .form-header p {
      color: #666;
      margin: 0;
      font-size: 1.05rem;
    }

    .form {
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
      font-size: 0.95rem;
    }

    .form-input {
      padding: 0.75rem 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 0.5rem;
      font-family: inherit;
      font-size: 1rem;
      transition: all 0.3s ease;

      &:focus {
        outline: none;
        border-color: #C41E3A;
        box-shadow: 0 0 0 3px rgba(196, 30, 58, 0.1);
      }

      &:invalid {
        border-color: #e74c3c;
      }
    }

    textarea.form-input {
      resize: vertical;
      min-height: 120px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .char-count {
      font-size: 0.85rem;
      color: #999;
      text-align: right;
    }

    .error-message {
      color: #e74c3c;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
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

    .btn-secondary {
      background: #f0f0f0;
      color: #333;
      border: 2px solid #e0e0e0;

      &:hover:not(:disabled) {
        background: #e8e8e8;
        border-color: #C41E3A;
      }
    }

    .btn-large {
      width: 100%;
      padding: 1rem;
      font-size: 1.05rem;
    }

    .error-alert {
      background: #fce4e6;
      border-left: 4px solid #e74c3c;
      padding: 1rem;
      border-radius: 0.5rem;
      color: #c0392b;
      font-weight: 500;
    }

    /* Success Message */
    .success-message {
      text-align: center;
      padding: 2rem;
      animation: slideInUp 0.6s ease-out;
    }

    .success-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 1rem;
      background: linear-gradient(135deg, #8B0000 0%, #C41E3A 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      animation: popIn 0.6s ease-out;
    }

    .success-message h2 {
      color: #8B0000;
      font-size: 1.8rem;
      margin: 0 0 0.5rem 0;
    }

    .success-message p {
      color: #666;
      margin: 0.5rem 0;
    }

    .reference-id {
      background: #f0f0f0;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      font-family: monospace;
      font-weight: 600;
      margin: 1.5rem 0;
      color: #8B0000;
    }

    .success-message .form-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 2rem;
    }

    .success-message .btn {
      width: 100%;
    }

    /* Animations */
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

    @keyframes popIn {
      0% {
        opacity: 0;
        transform: scale(0.5);
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .form-wrapper {
        padding: 2rem 1.5rem;
      }

      .form-header h1 {
        font-size: 1.5rem;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComplaintFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private complaintService = inject(ComplaintService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  complaintForm: FormGroup;
  categories = signal<Category[]>([]);
  submitted = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal('');
  referenceId = signal('');
  showDepartmentField = signal(false);

  constructor() {
    const currentUser = this.authService.currentUser();
    this.complaintForm = this.fb.group({
      name: [currentUser?.name ?? '', Validators.required],
      email: [currentUser?.email ?? '', [Validators.required, Validators.email]],
      department: [currentUser?.department ?? ''],
      category: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    // ⚠️ SECURITY: Verify user is authenticated before allowing form access
    this.verifyAuth();

    // Load categories
    this.categoryService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
      error: (err) => console.error('Failed to load categories:', err)
    });

    // Check for pre-selected category
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.complaintForm.patchValue({ category: params['category'] });
      }
    });
  }

  /**
   * ⚠️ SECURITY: Verify user is authenticated
   */
  private verifyAuth(): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      console.warn('Access denied: User must be authenticated to submit complaints');
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/complaint-form' } });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.complaintForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onCategoryChange(): void {
    const category = this.complaintForm.get('category')?.value;
    this.showDepartmentField.set(category === 'others');
    
    // Update department validation
    const departmentControl = this.complaintForm.get('department');
    if (category === 'others') {
      departmentControl?.setValidators([Validators.required]);
    } else {
      departmentControl?.clearValidators();
      departmentControl?.setValue('');
    }
    departmentControl?.updateValueAndValidity();
  }

  submitComplaint(): void {
    if (this.complaintForm.invalid) {
      this.errorMessage.set('Please fill in all required fields correctly.');
      return;
    }

    this.isSubmitting.set(true);
    const complaint = { ...this.complaintForm.getRawValue() };

    this.complaintService.submitComplaint(complaint).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.referenceId.set(response.id || Math.random().toString(36).substr(2, 9));
        this.submitted.set(true);
        console.log('Complaint submitted successfully by authenticated user');
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.error('Error submitting complaint:', err);
        
        // Handle authentication errors
        if (err.message.includes('authenticated')) {
          this.errorMessage.set('Your session has expired. Please log in again.');
          setTimeout(() => this.router.navigate(['/login']), 2000);
        } else {
          this.errorMessage.set('Failed to submit complaint. Please try again.');
        }
      }
    });
  }

  resetForm(): void {
    const currentUser = this.authService.currentUser();
    this.complaintForm.reset({
      name: currentUser?.name ?? '',
      email: currentUser?.email ?? '',
      department: currentUser?.department ?? '',
      category: '',
      message: ''
    });
    this.submitted.set(false);
    this.errorMessage.set('');
    this.showDepartmentField.set(false);
  }

  goHome(): void {
    this.router.navigate(['/dashboard']);
  }
}
