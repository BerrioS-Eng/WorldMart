import {Product, Review} from '../../models/product.model';
import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDividerModule} from '@angular/material/divider';
import {MatChipsModule} from '@angular/material/chips';
import {MatCardModule} from '@angular/material/card';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {ProductsApi} from '../../services/product.api';
import {BehaviorSubject, catchError, map, of, shareReplay, startWith, switchMap} from 'rxjs';

export interface ProductDetailDialogData {
  id: number;
  preload?: Product;
}

interface ProductVm {
  loading: boolean;
  product?: Product;
  productError?: string;
  reviews: Review[];
  reviewsError?: string;
}

@Component({
  selector: 'app-product-detail-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-detail-dialog.component.html',
  styleUrls: ['./product-detail-dialog.component.css']
})

export class ProductDetailDialogComponent {
  private readonly api = inject(ProductsApi);
  private readonly snack = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<ProductDetailDialogComponent, void>);
  selectedImage: string | null = null;

  readonly data = inject<ProductDetailDialogData>(MAT_DIALOG_DATA);

  private readonly reload$ = new BehaviorSubject<void>(void 0);

  private readonly product$ = this.reload$.pipe(
    switchMap(() => this.api.getProductById(this.data.id).pipe(
      catchError(() => {
        this.notify('No se pudo cargar el producto');
        return of(undefined);
      })
    )),
    shareReplay({bufferSize: 1, refCount: true})
  );

  readonly vm$ = this.product$.pipe(
    startWith(this.data.preload as Product | undefined),
    map((product) => {
      const vm: ProductVm = {
        loading: !product,
        product: product,
        reviews: product?.reviews ?? []
      };
      if (!product) {
        vm.productError = 'No se pudo cargar la información del producto.';
      }
      return vm;
    })
  );

  reload(): void {
    this.reload$.next();
  }

  notify(msg: string): void {
    this.snack.open(msg, 'Cerrar', {duration: 2500});
  }

  close(): void {
    this.dialogRef.close();
  }

  trackByUrl = (_: number, url: string) => url;
  trackByReview = (_: number, r: Review) => r.comment + String(r.date) + String(r.rating);
}

