import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { ApiServiceTs } from '../../service/api.service.ts.js';

// PrimeNG imports
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  
  loginForm: any;
  message: string = '';

  constructor(
    private apiService: ApiServiceTs, 
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }


  submit() {
    if (this.loginForm.valid) {
      this.apiService.login(this.loginForm.value)
        .subscribe({
          next: () => {
            console.log('Login successful');
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Успешен вход', 
              detail: 'Добре дошъл!' 
            });
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 1000);
          },
          error: () => {
            console.log('Invalid credentials');
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Грешка', 
              detail: 'Невалиден имейл или парола' 
            });
          }
        });
    } else {
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Внимание', 
        detail: 'Моля попълнете всички полета правилно' 
      });
    }
  }
}
