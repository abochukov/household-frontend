import { Component, OnInit } from '@angular/core';

import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup
} from '@angular/forms';

import {
  CommonModule,
  NgClass
} from '@angular/common';

import {
  Router,
  RouterLink
} from '@angular/router';

import { ApiServiceTs } from '../../service/api.service.ts.js';
import { ToastService } from '../../services/toast.service';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-login',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NgClass,

    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule
  ],

  templateUrl: './login.html',
  styleUrl: './login.scss'
})

export class Login implements OnInit {

  loginForm!: FormGroup;

  message: string = '';

  showPassword: boolean = false;

  constructor(
    private apiService: ApiServiceTs,
    private fb: FormBuilder,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {

    this.loginForm = this.fb.group({

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        Validators.required
      ]

    });

  }

  submit(): void {

    if (this.loginForm.valid) {

      this.apiService
        .login(this.loginForm.value)

        .subscribe({

          next: () => {

            console.log('Login successful');

            this.toastService.showSuccess('Добре дошъл!', 'Успешен вход');

            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 1000);

          },

          error: (error) => {

            console.log('Invalid credentials');
            const backendMessage = error?.error?.message;
            const status = error?.status;

            let detail = 'Невалиден имейл или парола';

            if (status === 401 && backendMessage === 'Invalid credentials') {
              detail = 'Грешен имейл или парола';
            } else if (status === 401 && backendMessage === 'Account is not verified') {
              detail = 'Акаунтът не е верифициран. Проверете имейла си за потвърждение.';
            } else if (typeof backendMessage === 'string' && backendMessage.trim()) {
              detail = backendMessage;
            }

            this.toastService.showError(detail);

          }

        });

    } else {

      this.toastService.showWarning('Моля попълнете всички полета правилно');

    }

  }

}