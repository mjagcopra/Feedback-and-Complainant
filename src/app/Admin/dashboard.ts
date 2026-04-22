import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Complaint {
  id: number;
  studentName?: string;
  department: string;
  category: string;
  description: string;
  status: 'Pending' | 'In Review' | 'Resolved';
  timestamp: Date;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  complaints: Complaint[] = [
    {
      id: 1,
      studentName: 'John Doe',
      department: 'IT',
      category: 'ICT',
      description: 'The WiFi connection is very slow in the library.',
      status: 'Pending',
      timestamp: new Date('2023-10-01T10:00:00'),
    },
    {
      id: 2,
      department: 'SBMA',
      category: 'Facilities',
      description: 'The classroom projector is not working.',
      status: 'In Review',
      timestamp: new Date('2023-10-02T14:30:00'),
    },
    {
      id: 3,
      studentName: 'Jane Smith',
      department: 'IT',
      category: 'Faculty',
      description: 'Professor X is not responding to emails.',
      status: 'Resolved',
      timestamp: new Date('2023-09-28T09:15:00'),
    },
  ];

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'In Review':
        return 'status-in-review';
      case 'Resolved':
        return 'status-resolved';
      default:
        return '';
    }
  }

  onNotificationClick(): void {
    console.log('Notification clicked');
  }

  onProfileClick(): void {
    console.log('Profile clicked');
  }
}
