import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private messageService: MessageService) {}

  showSuccess(message: string, summary: string = 'Успех') {
    this.messageService.add({
      severity: 'success',
      summary: summary,
      detail: message,
      life: 3000
    });
  }

  showError(message: string, summary: string = 'Грешка') {
    this.messageService.add({
      severity: 'error',
      summary: summary,
      detail: message,
      life: 5000
    });
  }

  showInfo(message: string, summary: string = 'Информация') {
    this.messageService.add({
      severity: 'info',
      summary: summary,
      detail: message,
      life: 3000
    });
  }

  showWarning(message: string, summary: string = 'Внимание') {
    this.messageService.add({
      severity: 'warn',
      summary: summary,
      detail: message,
      life: 4000
    });
  }
}
