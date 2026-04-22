import { Component, ElementRef, ViewChild, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import { forkJoin, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { AdminService, DashboardData, AdminComplaint, DailySubmittedEntry } from '../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterLink, FormsModule, BaseChartDirective],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  lastUpdated: Date | null = null;
  @ViewChild('complaintManagementSection') complaintManagementSection?: ElementRef<HTMLElement>;

  private readonly dashboardCacheKey = 'admin_dashboard_cache';
  private readonly complaintsCacheKey = 'admin_complaints_cache';
  private readonly filterCacheKey = 'admin_complaints_filter';
  private readonly minGraphLoadingMs = 1000;
  private readonly maxGraphLoadingMs = 3000;
  private refreshHardCapTimerId: number | null = null;
  private router = inject(Router);
  private authService = inject(AuthService);
  private adminService = inject(AdminService);

  dashboardData: DashboardData | null = null;
  loading = true;
  selectedFilter: 'all' | 'pending' | 'in_progress' | 'resolved' = 'all';
  currentUserId: string = '';
  allComplaints: AdminComplaint[] = [];
  complaints: AdminComplaint[] = [];
  loadingComplaints = false;
  loadingDailyReports = false;
  isRefreshing = false;
  usingFallbackDailyData = false;
  complaintsError = '';
  dailyReportsError = '';
  actionMessage = '';
  actionInfo = '';
  actionError = '';
  showComplaintModal = false;
  selectedComplaint: AdminComplaint | null = null;

  readonly dailyChartType: ChartConfiguration<'bar'>['type'] = 'bar';
  readonly dailyChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `Submitted: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Day of Month',
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 16,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
        title: {
          display: true,
          text: 'Complaints Submitted',
        },
      },
    },
  };
  dailyChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Submitted', backgroundColor: '#C41E3A', hoverBackgroundColor: '#8B0000', borderRadius: 4 },
    ],
  };

  // Computed properties for backward compatibility
  get stats() {
    if (!this.dashboardData) {
      return {
        totalReports: 0,
        submitted: 0,
        inProgress: 0,
        resolved: 0
      };
    }
    return {
      totalReports: this.dashboardData.totalComplaints,
      submitted: this.dashboardData.pendingComplaints,
      inProgress: this.dashboardData.inProgressComplaints,
      resolved: this.dashboardData.resolvedComplaints
    };
  }

  ngOnInit(): void {
    // ⚠️ SECURITY: Verify user is authenticated before loading admin data
    this.verifyAuth();
    this.restoreCachedState();
    this.refreshAdminData();
    this.lastUpdated = new Date();
  }

  /**
   * ⚠️ SECURITY: Verify user is authenticated
   * Future: Add admin role check here
   */
  private verifyAuth(): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      console.warn('Access denied: User not authenticated');
      this.router.navigate(['/login']);
      return;
    }
    this.currentUserId = String(currentUser.id ?? '');
    console.log('Admin dashboard loaded for user:', currentUser.email);
    // TODO: Add role check when admin role system is implemented
    // if (currentUser.role !== 'admin') {
    //   console.error('Access denied: Admin role required');
    //   this.router.navigate(['/']);
    // }
  }

  loadAdminData(): void {
    const hasCachedComplaints = this.allComplaints.length > 0;
    const refreshStartedAt = Date.now();

    this.loading = !this.dashboardData;
    this.loadingComplaints = !hasCachedComplaints;
    this.loadingDailyReports = true;
    this.isRefreshing = true;
    this.usingFallbackDailyData = false;
    this.complaintsError = '';
    this.dailyReportsError = '';

    if (this.refreshHardCapTimerId !== null) {
      window.clearTimeout(this.refreshHardCapTimerId);
    }

    this.refreshHardCapTimerId = window.setTimeout(() => {
      this.loading = false;
      this.loadingComplaints = false;
      this.loadingDailyReports = false;
      this.isRefreshing = false;
    }, this.maxGraphLoadingMs);

    const complaints$ = this.adminService.getComplaints('all').pipe(
      timeout(this.maxGraphLoadingMs),
      catchError((err: Error) => {
        console.error('Error loading complaints:', err);
        const message = err.message || 'Failed to load complaints.';
        this.complaintsError = message;
        if (message.includes('authenticated') || message.includes('401')) {
          this.router.navigate(['/login']);
        }
        return of<AdminComplaint[] | null>(null);
      })
    );

    const dailyReports$ = this.adminService.getDailySubmitted().pipe(
      timeout(this.maxGraphLoadingMs),
      catchError((err: Error) => {
        console.error('Error loading daily chart:', err);
        this.dailyReportsError = err.message || 'Failed to load daily reports graph.';
        return of<DailySubmittedEntry[] | null>(null);
      })
    );

    forkJoin({ complaints: complaints$, dailyEntries: dailyReports$ }).subscribe({
      next: ({ complaints, dailyEntries }) => {
        if (complaints) {
          this.allComplaints = complaints;
          this.persistComplaintsState(complaints);
          this.dashboardData = this.buildDashboardData(complaints);
          this.persistDashboardState(this.dashboardData);
          this.applyComplaintFilter();
        }

        if (dailyEntries) {
          this.dailyReportsError = '';
          this.usingFallbackDailyData = false;
          this.dailyChartData = this.buildCurrentMonthChartData(dailyEntries);
        } else if (complaints) {
          this.dailyChartData = this.buildCurrentMonthChartData(this.buildDailyEntriesFromComplaints(complaints));
          this.dailyReportsError = '';
          this.usingFallbackDailyData = true;
        }

        this.lastUpdated = new Date();
        this.completeRefreshCycle(refreshStartedAt);
      },
      error: () => {
        this.completeRefreshCycle(refreshStartedAt);
      }
    });
  }

  /**
   * Get the maximum value in the daily data for chart scaling
   * Note: Daily data not available in current API
   */
  getMaxValue(): number {
    return this.stats.totalReports || 100;
  }

  /**
   * Calculate bar height as percentage
   */
  getBarHeight(value: number): number {
    const max = this.getMaxValue();
    return (value / max) * 100;
  }

  /**
   * Get month name from date key
   */
  getMonthName(dateKey: string): string {
    const months = [
      '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const [, month] = dateKey.split('-');
    return months[parseInt(month)] || '';
  }

  /**
   * Get color for bar based on status distribution
   * Note: Not used in current implementation
   */
  getBarColor(data: any): string {
    // Placeholder implementation
    return '#007BFF';
  }

  /**
   * Filter handlers
   */
  onFilterChange(filter: string): void {
    if (filter === 'all' || filter === 'pending' || filter === 'in_progress' || filter === 'resolved') {
      this.selectedFilter = filter;
      sessionStorage.setItem(this.filterCacheKey, this.selectedFilter);
      this.applyComplaintFilter();
    }
  }

  /**
   * Navigate to complaint details
   */
  viewAllComplaints(): void {
    this.selectedFilter = 'all';
    sessionStorage.setItem(this.filterCacheKey, this.selectedFilter);
    this.applyComplaintFilter();
    setTimeout(() => this.scrollToComplaintManagement(), 0);
  }

  refreshAdminData(): void {
    this.loadAdminData();
  }

  navigateHome(): void {
    const currentUser = this.authService.getCurrentUser();
    const targetRoute = currentUser?.role === 'admin' ? '/admin-dashboard' : '/dashboard';
    void this.router.navigate([targetRoute]);
  }

  openComplaintDetails(complaint: AdminComplaint): void {
    this.selectedComplaint = complaint;
    this.showComplaintModal = true;
  }

  closeComplaintDetails(): void {
    this.selectedComplaint = null;
    this.showComplaintModal = false;
  }

  hasDailyReportData(): boolean {
    return this.dailyChartData.datasets.some((dataset) => dataset.data.some((value) => Number(value) > 0));
  }

  markInReview(complaintId: number): void {
    this.updateStatus(complaintId, 'in_progress', 'Complaint marked as In Review.');
  }

  markResolved(complaintId: number): void {
    this.updateStatus(complaintId, 'resolved', 'Complaint marked as Resolved. User has been notified.');
  }

  deleteComplaint(complaintId: number): void {
    const confirmed = window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    this.actionMessage = '';
    this.actionError = '';
    this.adminService.deleteComplaint(complaintId).subscribe({
      next: (response) => {
        this.actionMessage = response.userNotification || 'Complaint deleted successfully.';
        this.refreshAdminData();
      },
      error: (err: Error) => {
        this.actionError = err.message || 'Failed to delete complaint.';
      }
    });
  }

  private updateStatus(
    complaintId: number,
    status: 'pending' | 'in_progress' | 'resolved',
    successMessage: string
  ): void {
    this.actionMessage = '';
    this.actionInfo = '';
    this.actionError = '';

    this.adminService.updateComplaintStatus(complaintId, status).subscribe({
      next: () => {
        if (status === 'in_progress') {
          this.actionInfo = 'Complaint marked as In Review. The student has been notified.';
        } else {
          this.actionMessage = successMessage;
        }
        this.refreshAdminData();
      },
      error: (err: Error) => {
        this.actionError = err.message || 'Failed to update complaint status.';
      }
    });
  }

  getStatusLabel(status: 'pending' | 'in_progress' | 'resolved'): string {
    if (status === 'in_progress') {
      return 'In Review';
    }

    if (status === 'resolved') {
      return 'Resolved';
    }

    return 'Pending';
  }

  /**
   * Logout handler
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Export report as JSON
   */
  exportReport(): void {
    if (!this.dashboardData) return;

    const dataStr = JSON.stringify(this.dashboardData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Get percentage of resolved complaints
   */
  getResolutionPercentage(): number {
    if (this.stats.totalReports === 0) return 0;
    return Math.round((this.stats.resolved / this.stats.totalReports) * 100);
  }

  /**
   * Get average response time (placeholder)
   */
  getAverageResponseTime(): string {
    return '2.5 days';
  }

  private scrollToComplaintManagement(): void {
    this.complaintManagementSection?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private buildCurrentMonthChartData(entries: DailySubmittedEntry[]): ChartData<'bar'> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = now.toLocaleDateString('en-US', { month: 'short' });

    const countByDate = new Map<string, number>();
    for (const entry of entries) {
      countByDate.set(entry.date, entry.count);
    }

    const labels: string[] = [];
    const data: number[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const paddedMonth = String(month + 1).padStart(2, '0');
      const paddedDay = String(day).padStart(2, '0');
      const key = `${year}-${paddedMonth}-${paddedDay}`;
      labels.push(`${monthName} ${day}`);
      data.push(countByDate.get(key) ?? 0);
    }

    return {
      labels,
      datasets: [
        {
          data,
          label: 'Submitted',
          backgroundColor: '#C41E3A',
          hoverBackgroundColor: '#8B0000',
          borderRadius: 4,
        },
      ],
    };
  }

  private buildDailyEntriesFromComplaints(complaints: AdminComplaint[]): DailySubmittedEntry[] {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const counts = new Map<string, number>();

    for (const complaint of complaints) {
      if (complaint.status !== 'pending') {
        continue;
      }

      const createdAt = new Date(complaint.created_at);
      if (Number.isNaN(createdAt.getTime())) {
        continue;
      }

      if (createdAt.getFullYear() !== year || createdAt.getMonth() !== month) {
        continue;
      }

      const key = createdAt.toISOString().slice(0, 10);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
  }

  private completeRefreshCycle(refreshStartedAt: number): void {
    const elapsed = Date.now() - refreshStartedAt;
    const remaining = Math.max(this.minGraphLoadingMs - elapsed, 0);

    if (this.refreshHardCapTimerId !== null) {
      window.clearTimeout(this.refreshHardCapTimerId);
      this.refreshHardCapTimerId = null;
    }

    window.setTimeout(() => {
      this.loading = false;
      this.loadingComplaints = false;
      this.loadingDailyReports = false;
      this.isRefreshing = false;
    }, remaining);
  }

  private buildDashboardData(complaints: AdminComplaint[]): DashboardData {
    const categories = complaints.reduce<Record<string, number>>((result, complaint) => {
      const key = complaint.category_name || 'Uncategorized';
      result[key] = (result[key] ?? 0) + 1;
      return result;
    }, {});

    return {
      totalComplaints: complaints.length,
      pendingComplaints: complaints.filter((complaint) => complaint.status === 'pending').length,
      inProgressComplaints: complaints.filter((complaint) => complaint.status === 'in_progress').length,
      resolvedComplaints: complaints.filter((complaint) => complaint.status === 'resolved').length,
      categories,
      recentComplaints: complaints.slice(0, 5),
    };
  }

  private applyComplaintFilter(): void {
    if (this.selectedFilter === 'all') {
      this.complaints = this.allComplaints;
      return;
    }

    this.complaints = this.allComplaints.filter((complaint) => complaint.status === this.selectedFilter);
  }

  private restoreCachedState(): void {
    const savedFilter = sessionStorage.getItem(this.filterCacheKey);
    if (savedFilter === 'all' || savedFilter === 'pending' || savedFilter === 'in_progress' || savedFilter === 'resolved') {
      this.selectedFilter = savedFilter;
    }

    const cachedDashboard = sessionStorage.getItem(this.dashboardCacheKey);
    if (cachedDashboard) {
      try {
        this.dashboardData = JSON.parse(cachedDashboard) as DashboardData;
      } catch {
        sessionStorage.removeItem(this.dashboardCacheKey);
      }
    }

    const cachedComplaints = sessionStorage.getItem(this.complaintsCacheKey);
    if (cachedComplaints) {
      try {
        this.allComplaints = JSON.parse(cachedComplaints) as AdminComplaint[];
        if (!this.dashboardData) {
          this.dashboardData = this.buildDashboardData(this.allComplaints);
        }
        this.applyComplaintFilter();
      } catch {
        sessionStorage.removeItem(this.complaintsCacheKey);
      }
    }

    // Daily chart is always fetched fresh from the dedicated endpoint – no cache restore needed.
    this.loading = false;
  }

  private persistDashboardState(data: DashboardData): void {
    sessionStorage.setItem(this.dashboardCacheKey, JSON.stringify(data));
  }

  private persistComplaintsState(complaints: AdminComplaint[]): void {
    sessionStorage.setItem(this.complaintsCacheKey, JSON.stringify(complaints));
  }
}
