import { Component, OnInit, signal, ChangeDetectionStrategy, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CategoryService, Category } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    
    <main class="homepage">
      <!-- Hero Section -->
      <section class="hero" #heroSection>
        <div class="hero-content">
          <h1 class="hero-title">Your Voice Matters</h1>
          <p class="hero-subtitle">
            A centralized platform for students to submit feedback and complaints regarding
            school services, facilities, and personnel. We're committed to improving your university experience.
          </p>
          <div class="hero-buttons">
            <button class="btn btn-primary" (click)="navigateTo('/complaint-form')">Get Started</button>
            <button class="btn btn-secondary" (click)="scrollToCategories()">Learn More</button>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features">
        <div class="features-container">
          <div class="feature-card" *ngFor="let feature of features" (click)="feature.onclick()">
            <div class="feature-icon">{{ feature.icon }}</div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="categories" #categoriesSection>
        <div class="categories-container">
          <h2 class="section-title">Complaint Categories</h2>
          <p class="section-subtitle">We handle feedback across all aspects of university operations</p>
          
          <div class="categories-grid">
            @for (category of categories(); track category.id) {
              <div class="category-card" (click)="navigateToCategory(category)">
                <div class="category-icon">{{ category.icon }}</div>
                <h3 class="category-name">{{ category.name }}</h3>
                <p class="category-description">{{ category.description }}</p>
              </div>
            } @empty {
              <p class="loading">Loading categories...</p>
            }
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta">
        <div class="cta-content">
          <h2>Ready to Make a Difference?</h2>
          <p>Share your feedback and help us improve</p>
          <button class="btn btn-large" (click)="navigateTo('/complaint-form')">Submit Feedback Now</button>
        </div>
      </section>
    </main>
  `,
  styles: [`
    .homepage {
      background: #f8f9fa;
      scroll-behavior: smooth;
    }

    /* Hero Section */
    .hero {
      background: #8B0000;
      color: white;
      padding: 100px 2rem;
      text-align: center;
      animation: fadeInDown 0.8s ease-out;
      min-height: 60vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .hero-content {
      max-width: 700px;
      animation: fadeInUp 0.8s ease-out 0.2s both;
    }

    .hero-title {
      font-size: clamp(2rem, 8vw, 4rem);
      font-weight: 700;
      margin: 0 0 1.5rem 0;
      letter-spacing: -1px;
      color: white;
    }

    .hero-subtitle {
      font-size: 1.1rem;
      margin: 0 0 2rem 0;
      line-height: 1.6;
      opacity: 0.95;
      color: white;
    }

    .hero-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .btn-primary {
      background: white;
      color: #8B0000;
      
      &:hover {
        background: #f0f0f0;
        transform: translateY(-3px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
      }

      &:active {
        transform: translateY(-1px);
      }
    }

    .btn-secondary {
      background: transparent;
      color: white;
      border: 2px solid white;
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-3px);
      }
    }

    .btn-large {
      padding: 1rem 2.5rem;
      font-size: 1.1rem;
      background: white;
      color: #8B0000;
      
      &:hover {
        background: #f0f0f0;
        transform: translateY(-3px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
      }
    }

    /* Features Section */
    .features {
      padding: 80px 2rem;
      background: white;
    }

    .features-container {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
      padding: 2rem;
      border-radius: 1rem;
      text-align: center;
      border: 2px solid transparent;
      transition: all 0.3s ease;
      cursor: pointer;
      animation: fadeInUp 0.6s ease-out forwards;
      
      &:hover {
        border-color: #C41E3A;
        transform: translateY(-8px);
        box-shadow: 0 12px 24px rgba(196, 30, 58, 0.15);
      }
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .feature-title {
      font-size: 1.3rem;
      font-weight: 700;
      color: #8B0000;
      margin: 0 0 0.5rem 0;
    }

    .feature-description {
      color: #666;
      line-height: 1.6;
      margin: 0;
    }

    /* Categories Section */
    .categories {
      padding: 80px 2rem;
      background: #f8f9fa;
    }

    .categories-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .section-title {
      font-size: clamp(2rem, 6vw, 3rem);
      text-align: center;
      color: #8B0000;
      margin: 0 0 0.5rem 0;
      font-weight: 700;
    }

    .section-subtitle {
      text-align: center;
      color: #666;
      margin: 0 0 3rem 0;
      font-size: 1.1rem;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
    }

    .category-card {
      background: white;
      padding: 2.5rem 2rem;
      border-radius: 1rem;
      text-align: center;
      border-left: 4px solid #8B0000;
      transition: all 0.3s ease;
      cursor: pointer;
      animation: fadeInUp 0.6s ease-out forwards;
      
      &:hover {
        transform: translateY(-10px);
        box-shadow: 0 16px 32px rgba(139, 0, 0, 0.15);
        border-left-color: #C41E3A;
      }
    }

    .category-icon {
      font-size: 3.5rem;
      margin-bottom: 1rem;
    }

    .category-name {
      font-size: 1.4rem;
      font-weight: 700;
      color: #8B0000;
      margin: 0 0 0.75rem 0;
    }

    .category-description {
      color: #666;
      line-height: 1.6;
      margin: 0;
      font-size: 0.95rem;
    }

    /* CTA Section */
    .cta {
      background: linear-gradient(135deg, #8B0000 0%, #C41E3A 100%);
      color: white;
      padding: 80px 2rem;
      text-align: center;
    }

    .cta-content {
      max-width: 700px;
      margin: 0 auto;
    }

    .cta-content h2 {
      font-size: clamp(2rem, 6vw, 3rem);
      margin: 0 0 1rem 0;
    }

    .cta-content p {
      font-size: 1.1rem;
      margin: 0 0 2rem 0;
      opacity: 0.95;
    }

    .loading {
      text-align: center;
      color: #C41E3A;
      font-weight: 600;
    }

    /* Animations */
    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .hero {
        padding: 60px 1.5rem;
        min-height: 50vh;
      }

      .hero-title {
        font-size: 2.5rem;
      }

      .features {
        padding: 50px 1.5rem;
      }

      .categories {
        padding: 50px 1.5rem;
      }

      .cta {
        padding: 50px 1.5rem;
      }

      .hero-buttons {
        flex-direction: column;
        gap: 0.75rem;
      }

      .btn {
        width: 100%;
      }

      .feature-card,
      .category-card {
        animation-delay: 0.1s;
      }
    }

    @media (max-width: 480px) {
      .hero-title {
        font-size: 1.8rem;
      }

      .hero-subtitle {
        font-size: 1rem;
      }

      .features-container,
      .categories-grid {
        gap: 1.5rem;
      }

      .feature-card,
      .category-card {
        padding: 1.5rem 1rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomepageComponent implements OnInit {
  @ViewChild('categoriesSection') categoriesSection: ElementRef | undefined;
  
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);
  private router = inject(Router);

  categories = signal<Category[]>([]);

  features = [
    {
      icon: '📝',
      title: 'Submit Feedback',
      description: 'Share your concerns or suggestions quickly and securely.',
      onclick: () => this.handleFeatureClick('/complaint-form')
    },
    {
      icon: '📊',
      title: 'View Categories',
      description: 'Explore all complaint categories and find the right place to submit.',
      onclick: () => this.scrollToCategories()
    },
    {
      icon: '👤',
      title: 'Student Support',
      description: 'Access support and resources designed for the student community.',
      onclick: () => this.handleFeatureClick('/complaint-form')
    }
  ];

  ngOnInit(): void {
    // Redirect to dashboard if user is already logged in
    const currentUser = this.authService.currentUser();
    if (currentUser && this.authService.isAuthenticated()) {
      const targetRoute = currentUser.role === 'admin' ? '/admin-dashboard' : '/dashboard';
      this.router.navigate([targetRoute]);
      return;
    }

    this.categoryService.getCategories().subscribe({
      next: (cats: Category[]) => this.categories.set(cats),
      error: (err: any) => console.error('Failed to load categories:', err)
    });
  }

  navigateTo(route: string): void {
    if (route === '/complaint-form' && !this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate([route]);
  }

  handleFeatureClick(route: string): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.navigateTo(route);
  }

  navigateToCategory(category: Category): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/complaint-form'], { queryParams: { category: category.id } });
  }

  scrollToCategories(): void {
    this.categoriesSection?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
  }
}
