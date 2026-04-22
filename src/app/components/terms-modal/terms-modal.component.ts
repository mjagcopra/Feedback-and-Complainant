import { Component, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="onOverlayClick($event)" role="dialog" aria-modal="true" aria-labelledby="terms-title">
      <div class="modal-container">
        <div class="modal-header">
          <h2 id="terms-title">Terms and Conditions</h2>
          <button type="button" class="close-btn" (click)="close.emit()" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <p class="intro">
            ICT Feedback &amp; Complaint Management System — Terms and Conditions
          </p>

          <section>
            <h3>1. Purpose</h3>
            <p>
              The ICT Feedback and Complaint Management System (ICT-FCMS) is provided exclusively for the use
              of registered students and employees of the institution. Its purpose is to provide a transparent
              and structured channel for submitting, tracking, and resolving ICT-related concerns.
            </p>
          </section>

          <section>
            <h3>2. Confidentiality</h3>
            <p>
              The system ICT ensures confidentiality. All complaints, feedback, and personal information
              submitted through this platform are handled with strict confidentiality. Information will only
              be accessible to authorized ICT personnel and relevant administrators involved in the resolution
              process. User data will not be disclosed to third parties without consent, except as required
              by institutional policy or applicable law.
            </p>
          </section>

          <section>
            <h3>3. Secure Handling</h3>
            <p>
              The ICT office is committed to secure handling of user complaints. All data transmitted through
              the system is protected using industry-standard security measures. Users are responsible for
              maintaining the confidentiality of their own login credentials.
            </p>
          </section>

          <section>
            <h3>4. Compliance with Institutional Policies</h3>
            <p>
              Use of this system must comply with institutional policies. Misuse, submission of false information,
              or any attempt to abuse the system may result in disciplinary action in accordance with the
              institution's code of conduct.
            </p>
          </section>

          <section>
            <h3>5. Data Retention</h3>
            <p>
              Complaint records and associated personal data are retained in accordance with institutional
              data retention policies. Users may request access to their own data by contacting the ICT office.
            </p>
          </section>

          <section>
            <h3>6. Acceptance</h3>
            <p>
              By registering and using the ICT Feedback &amp; Complaint Management System, you acknowledge
              that you have read, understood, and agree to be bound by these Terms and Conditions.
            </p>
          </section>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-primary" (click)="close.emit()">I Understand</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      animation: fadeIn 0.2s ease;
    }

    .modal-container {
      background: white;
      border-radius: 1rem;
      width: 100%;
      max-width: 600px;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideInUp 0.25s ease;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem 1.75rem 1rem;
      border-bottom: 1px solid #e0e0e0;
      flex-shrink: 0;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.4rem;
      color: #8B0000;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      color: #666;
      display: flex;
      align-items: center;
      border-radius: 0.25rem;
      transition: color 0.2s, background 0.2s;

      &:hover {
        color: #C41E3A;
        background: #fce4e6;
      }

      svg {
        width: 1.4rem;
        height: 1.4rem;
      }
    }

    .modal-body {
      overflow-y: auto;
      padding: 1.5rem 1.75rem;
      flex: 1;
    }

    .intro {
      font-weight: 700;
      color: #8B0000;
      font-size: 1rem;
      margin-bottom: 1.5rem;
    }

    section {
      margin-bottom: 1.25rem;
    }

    section h3 {
      font-size: 0.95rem;
      font-weight: 700;
      color: #333;
      margin: 0 0 0.4rem 0;
    }

    section p {
      margin: 0;
      color: #555;
      font-size: 0.9rem;
      line-height: 1.6;
    }

    .modal-footer {
      padding: 1rem 1.75rem 1.5rem;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: flex-end;
      flex-shrink: 0;
    }

    .btn {
      padding: 0.65rem 1.75rem;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #8B0000 0%, #C41E3A 100%);
      color: white;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 14px rgba(139, 0, 0, 0.3);
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 480px) {
      .modal-container {
        max-height: 92vh;
      }

      .modal-header,
      .modal-body,
      .modal-footer {
        padding-left: 1.25rem;
        padding-right: 1.25rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsModalComponent {
  close = output<void>();

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close.emit();
    }
  }
}
