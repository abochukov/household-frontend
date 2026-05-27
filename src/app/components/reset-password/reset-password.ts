import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiServiceTs } from '../../service/api.service.ts.js';
import { ToastService } from '../../services/toast.service';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;

  if (!password || !confirmPassword) return null;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPassword implements OnInit {
  resetForm!: FormGroup;
  token = '';
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiServiceTs,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    this.resetForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator }
    );

    if (!this.token) {
      this.toastService.showError('Липсва token за смяна на парола');
    }
  }

  submit(): void {
    if (!this.token) {
      this.toastService.showError('Липсва token за смяна на парола');
      return;
    }

    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      this.toastService.showWarning('Моля попълнете полетата коректно');
      return;
    }

    this.submitting = true;

    this.apiService.resetPassword({
      token: this.token,
      newPassword: this.resetForm.value.newPassword,
    }).subscribe({
      next: (response) => {
        this.toastService.showSuccess(response.message, 'Успешно');
        this.submitting = false;

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1200);
      },
      error: (error) => {
        const detail = error?.error?.message || 'Неуспешна смяна на парола';
        this.toastService.showError(detail);
        this.submitting = false;
      }
    });
  }
}
