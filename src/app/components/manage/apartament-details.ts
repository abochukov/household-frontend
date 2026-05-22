import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PropertyService, Property } from '../../services/property.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-apartament-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  providers: [PropertyService],
  templateUrl: './apartament-details.html',
  styleUrls: ['./apartament-details.scss']
})
export class ApartamentDetails implements OnInit {
  apartament: Property | null = null;
  detailsForm: FormGroup;
  loading = false;
  saving = false;
  editMode = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private propertyService: PropertyService,
    private toastService: ToastService
  ) {
    this.detailsForm = this.fb.group({
      property_number: ['', Validators.required],
      floor: [0, Validators.required],
      area: [0, [Validators.required, Validators.min(1)]],
      member_amount: [1, [Validators.required, Validators.min(1)]],
      ideal_share: [null, [Validators.min(0), Validators.max(100)]],
      email: ['', [Validators.email]],
      phone_number: [''],
      pets: [false],
      rent: [false],
      elevator: [false]
    });
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const propertyId = idParam ? parseInt(idParam, 10) : NaN;

    if (!propertyId) {
      this.toastService.showError('Невалиден идентификатор на имот');
      this.router.navigate(['/manage']);
      return;
    }

    this.loading = true;
    this.propertyService.getPropertyById(propertyId).subscribe({
      next: (property) => {
        this.apartament = property;
        this.patchForm(property);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 404) {
          this.toastService.showError('Имотът не е намерен');
        } else {
          this.toastService.showError('Грешка при зареждане на имота');
        }
        this.router.navigate(['/manage']);
      },
    });
  }

  startEdit() {
    if (!this.apartament) return;
    this.patchForm(this.apartament);
    this.editMode = true;
  }

  cancelEdit() {
    if (this.apartament) {
      this.patchForm(this.apartament);
    }
    this.editMode = false;
  }

  saveEdit() {
    if (!this.apartament?.property_id) {
      this.toastService.showError('Липсва идентификатор на имот');
      return;
    }

    if (this.detailsForm.invalid) {
      this.detailsForm.markAllAsTouched();
      this.toastService.showError('Моля, проверете въведените данни');
      return;
    }

    const payload = {
      ...this.detailsForm.value,
      floor: Number(this.detailsForm.value.floor),
      area: Number(this.detailsForm.value.area),
      member_amount: Number(this.detailsForm.value.member_amount),
      ideal_share:
        this.detailsForm.value.ideal_share === null || this.detailsForm.value.ideal_share === ''
          ? null
          : Number(this.detailsForm.value.ideal_share),
      email: this.detailsForm.value.email || null,
      phone_number: this.detailsForm.value.phone_number || null,
      pets: Boolean(this.detailsForm.value.pets),
      rent: Boolean(this.detailsForm.value.rent),
      elevator: Boolean(this.detailsForm.value.elevator)
    } as Partial<Property>;

    this.saving = true;
    this.propertyService.updateProperty(this.apartament.property_id, payload).subscribe({
      next: (updatedProperty) => {
        this.apartament = {
          ...this.apartament,
          ...updatedProperty
        };
        this.patchForm(this.apartament);
        this.editMode = false;
        this.saving = false;
        this.toastService.showSuccess('Данните са обновени успешно');
      },
      error: () => {
        this.saving = false;
        this.toastService.showError('Грешка при запис на промените');
      }
    });
  }

  private patchForm(property: Property) {
    this.detailsForm.patchValue({
      property_number: property.property_number,
      floor: property.floor,
      area: property.area,
      member_amount: property.member_amount,
      ideal_share: property.ideal_share ?? null,
      email: property.email ?? '',
      phone_number: property.phone_number ?? '',
      pets: property.pets ?? false,
      rent: property.rent ?? false,
      elevator: property.elevator ?? false
    });
  }
}
