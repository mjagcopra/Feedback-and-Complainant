import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Dashboard } from '../../Admin/dashboard.component';

@Component({
  selector: 'app-complaint-list',
  template: `<app-dashboard></app-dashboard>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComplaintListComponent {}