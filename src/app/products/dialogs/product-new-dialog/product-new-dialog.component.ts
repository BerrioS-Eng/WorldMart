import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ProductsApi} from '../../services/product.api';
import {CommonModule} from '@angular/common';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {Category, NewProductPayload} from '../../models/product.model';
import {catchError, of, shareReplay} from 'rxjs';


@Component({
  selector: "app-product-new-dialog",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-new-dialog.component.html',
  styleUrl: './product-new-dialog.component.css'
})
export class ProductNewDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ProductsApi);
  private readonly snack = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<ProductNewDialogComponent, 'created' | undefined>);

  submitting = false;

  readonly form = this.fb.group({
    title: this.fb.control('', {nonNullable: true, validators: [Validators.required]}),
    price: this.fb.control<number | null>(null, {validators: [Validators.required]}),
    brand: this.fb.control('', {nonNullable: true, validators: [Validators.required]}),
    category: this.fb.control('', {nonNullable: true, validators: [Validators.required]}),
    description: this.fb.control('', {nonNullable: true, validators: [Validators.required]}),
  });

  readonly categories$ = this.api.getCategories().pipe(
    catchError(() => of([] as Category[])),
    shareReplay({bufferSize: 1, refCount: true})
  );

  onSubmit(): void {
    if (this.form.invalid || this.submitting) return;
    const payload = this.form.getRawValue() as NewProductPayload;
    this.submitting = true;
    this.api.addProduct(payload).subscribe({
      next: (resp) => {
        console.log('Add response:', resp);
        this.snack.open('Producto creado', 'Cerrar', {duration: 2500});
        this.dialogRef.close('created');
      },
      error: () => {
        this.snack.open('No se pudo crear el producto', 'Cerrar', {duration: 3000});
      },
    }).add(() => this.submitting = false);
  }

  close(): void {
    this.dialogRef.close();
  }

}
