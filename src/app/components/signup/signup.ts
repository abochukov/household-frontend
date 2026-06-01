import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiServiceTs } from '../../service/api.service.ts.js';
import { ToastService } from '../../services/toast.service';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;

  if (!password || !confirmPassword) return null;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgClass],
  templateUrl: './signup.html',
  styleUrl: './signup.scss'
})
export class Signup implements OnInit {
  signupForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private apiService: ApiServiceTs,
    private fb: FormBuilder,
    private router: Router,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group(
      {
        firstname: ['', Validators.required],
        lastname: ['', Validators.required],
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator }
    );
  }

  submit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      this.toastService.showWarning('Моля попълнете всички задължителни полета правилно');
      return;
    }

    const { firstname, lastname, username, email, phone, password } = this.signupForm.value;

    this.apiService
      .signup({ firstname, lastname, username, email, phone, password })
      .subscribe({
        next: (response) => {
          this.toastService.showSuccess(
            'Регистрацията е успешна. Изпратихме имейл за потвърждение. Моля проверете пощата си и потвърдете акаунта.',
            'Потвърдете имейла си'
          );

          setTimeout(() => {
            this.router.navigate(['/login'], {
              queryParams: {
                registered: '1',
                email,
              },
            });
          }, 1800);
        },
        error: (error) => {
          const backendMessage = error?.error?.message;
          const status = error?.status;

          let detail = 'Неуспешна регистрация';

          if (status === 409 && backendMessage === 'User with this email already exists') {
            detail = 'Вече има акаунт с този имейл';
          } else if (status === 409 && backendMessage === 'Username is already taken') {
            detail = 'Потребителското име е заето';
          } else if (typeof backendMessage === 'string' && backendMessage.trim()) {
            detail = backendMessage;
          }

          this.toastService.showError(detail);
        }
      });
  }
}
