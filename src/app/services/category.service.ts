import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

type BackendCategory = {
  id: number;
  name: string;
};

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  
  private categories$ = new Observable<Category[]>();
  private readonly apiUrl = 'http://localhost:5000/api/categories';

  // Fallback categories used only when the API is unavailable.
  private readonly fallbackCategories: Category[] = [
    { id: '1', name: 'Network', icon: '🌐', description: 'Internet connectivity and network access concerns' },
    { id: '2', name: 'Software', icon: '💻', description: 'Software installation, licensing, and application issues' },
    { id: '3', name: 'Hardware', icon: '🖥️', description: 'Computer devices, peripherals, and lab equipment problems' },
    { id: '4', name: 'Facilities', icon: '🏢', description: 'Classrooms, labs, and campus facility concerns' },
    { id: '5', name: 'Access', icon: '🔐', description: 'Account access, permissions, and authentication issues' },
    { id: '6', name: 'Other', icon: '📝', description: 'Other ICT-related feedback and complaints' }
  ];

  constructor() {
    this.categories$ = this.http.get<BackendCategory[]>(this.apiUrl).pipe(
      map((categories) => categories.map((category) => this.mapCategory(category))),
      catchError(() => of(this.fallbackCategories))
    );
  }

  getCategories(): Observable<Category[]> {
    return this.categories$;
  }

  private mapCategory(category: BackendCategory): Category {
    return {
      id: String(category.id),
      name: category.name,
      icon: this.getCategoryIcon(category.name),
      description: this.getCategoryDescription(category.name),
    };
  }

  private getCategoryIcon(name: string): string {
    switch (name.toLowerCase()) {
      case 'network':
        return '🌐';
      case 'software':
        return '💻';
      case 'hardware':
        return '🖥️';
      case 'facilities':
        return '🏢';
      case 'access':
        return '🔐';
      default:
        return '📝';
    }
  }

  private getCategoryDescription(name: string): string {
    switch (name.toLowerCase()) {
      case 'network':
        return 'Internet connectivity and network access concerns';
      case 'software':
        return 'Software installation, licensing, and application issues';
      case 'hardware':
        return 'Computer devices, peripherals, and lab equipment problems';
      case 'facilities':
        return 'Classrooms, labs, and campus facility concerns';
      case 'access':
        return 'Account access, permissions, and authentication issues';
      default:
        return 'Other ICT-related feedback and complaints';
    }
  }
}
