import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ApiServiceTs } from '../../service/api.service.ts.js';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  
  loginForm: any;
  message: string = '';

  constructor(
    private apiService: ApiServiceTs, 
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.apiService.getHello().subscribe(res => {
      this.message = res;
    })
  }


  submit() {
    if (this.loginForm.valid) {
      this.apiService.login(this.loginForm.value)
        .subscribe({
          next: () => {
            console.log('Login successful');
            // Redirect след успешен login
            this.router.navigate(['/home']);
          },
          error: () => {
            console.log('Invalid credentials');
          }
        });
    }
  }
}
