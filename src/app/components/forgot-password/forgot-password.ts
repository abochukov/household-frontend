import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiServiceTs } from '../../service/api.service.ts.js';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword implements OnInit {
  forgotPasswordForm!: FormGroup;
  sending = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiServiceTs,
    private toastService: ToastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  submit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      this.toastService.showWarning('Моля въведете валиден имейл');
      return;
    }

    this.sending = true;

    this.apiService.forgotPassword(this.forgotPasswordForm.value).subscribe({
      next: (response) => {
        this.toastService.showSuccess(response.message, 'Готово');
        this.sending = false;

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1200);
      },
      error: (error) => {
        const detail = error?.error?.message || 'Неуспешна заявка за смяна на парола';
        this.toastService.showError(detail);
        this.sending = false;
      }
    });
  }
}
