import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  constructor(private apiService: ApiServiceTs, private fb: FormBuilder) { }

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
          },
          error: () => {
            console.log('Invalid credentials');
          }
        });
    }
  }
}
