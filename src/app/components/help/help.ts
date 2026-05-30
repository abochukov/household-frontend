import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './help.html',
  styleUrls: ['./help.scss']
})
export class Help {
  contactForm: FormGroup;
  submitted = false;

  private readonly supportEmail = 'support@domovakniga.bg';

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      topic: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  submitContactForm(): void {
    this.submitted = true;

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const { fullName, email, topic, message } = this.contactForm.value;
    const subject = encodeURIComponent(`[DomovaKniga] ${topic}`);
    const body = encodeURIComponent(
      `Име: ${fullName}\nИмейл: ${email}\n\nСъобщение:\n${message}`
    );

    window.location.href = `mailto:${this.supportEmail}?subject=${subject}&body=${body}`;
    this.contactForm.reset();
    this.submitted = false;
  }
}
