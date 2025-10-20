import {Category, Product} from '../core/models/product.model';
import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {ProductsGridComponent} from './ui/products-grid.component';
import {ProductsApi} from '../core/services/product.api';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged, map,
  of,
  shareReplay,
  startWith,
  switchMap
} from 'rxjs';
import {ProductDetailDialogComponent} from './product-detail-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AppStateService} from '../core/state/app-state.service';
import {AppEventsService} from '../core/state/app-events.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';


interface ListVm {
  products: Product[];
  total: number;
  loading: boolean;
  error?: string;
}

@Component({
  selector: 'app-products-section',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    ProductsGridComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section style="max-width: 1200px; margin: 24px auto; padding: 0 16px;">
      <h2 style="margin: 8px 0 12px;">Productos</h2>

      <div style="display: grid; grid-template-columns: 1fr 220px; gap: 12px; align-items: end;">
        <mat-form-field appearance="outline">
          <mat-label>Buscar</mat-label>
          <input matInput placeholder="Ej: iphone" [formControl]="searchCtrl">
          <button mat-icon-button matSuffix aria-label="Limpiar" *ngIf="(searchCtrl.value ?? '').length" (click)="searchCtrl.setValue('')">
            <mat-icon>close</mat-icon>
          </button>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Categorías</mat-label>
          <mat-select [formControl]="categoryCtrl">
            <mat-option [value]="'all'">Todas</mat-option>
            <mat-option *ngFor="let c of (categories$ | async)" [value]="c.slug">
              {{ c.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <ng-container *ngIf="vm$ | async as vm">
        <div *ngIf="vm.loading" style="display:flex; justify-content:center; padding: 24px;">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <p *ngIf="vm.error" style="color: #b00020;">{{ vm.error }}</p>

        <app-products-grid
          *ngIf="!vm.loading"
          [products]="vm.products"
          [isAdmin]="isAdmin()"
          (viewDetails)="onViewDetails($event)"
          (delete)="onDelete($event)">
        </app-products-grid>

        <mat-paginator
          [length]="vm.total"
          [pageSize]="pageSize"
          [pageIndex]="pageIndex$ | async"
          [pageSizeOptions]="[6, 12, 24]"
          (page)="onPage($event)"
          aria-label="Paginación">
        </mat-paginator>
      </ng-container>
    </section>
  `,
})

export class ProductsSectionComponent {
  private readonly api = inject(ProductsApi);

  readonly pageSizeDefault = 12;
  pageSize = this.pageSizeDefault;
  readonly pageIndex$ = new BehaviorSubject<number>(0);

  readonly searchCtrl = new FormControl<string>("", { nonNullable: true });
  readonly categoryCtrl = new FormControl<string>("all", { nonNullable: true });

  readonly search$ = this.searchCtrl.valueChanges.pipe(
    startWith(this.searchCtrl.value),
    debounceTime(400),
    distinctUntilChanged()
  );

  readonly category$ = this.categoryCtrl.valueChanges.pipe(startWith(this.categoryCtrl.value));

  readonly categories$ = this.api.getCategories().pipe(
    catchError(() => of([] as Category[])),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private readonly appState = inject(AppStateService);
  private readonly snack = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly reload$ = new BehaviorSubject<void>(void 0);
  private readonly events = inject(AppEventsService);

  readonly isAdmin = this.appState.isAdmin;

  constructor() {
    this.events.productMutate$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.reload$.next();
      })
  }

  readonly vm$ = combineLatest([
    this.search$,
    this.category$,
    this.pageIndex$,
    this.reload$,
  ]).pipe(
    switchMap(([q, category, pageIndex]) => {
      const skip = pageIndex * this.pageSize;

      // Ambos activos: pedir búsqueda y filtrar por categoría en cliente
      if (q && category !== 'all') {
        return this.api.searchProducts(q, { limit: 100, skip: 0 }).pipe(
          map(res => {
            const filtered = res.products.filter(p => p.category === category);
            const total = filtered.length;
            const page = filtered.slice(skip, skip + this.pageSize);
            return <ListVm>{ products: page, total, loading: false };
          }),
          catchError(() => of(<ListVm>{ products: [], total: 0, loading: false, error: 'No se pudo cargar la búsqueda.' }))
        );
      }

      // Solo búsqueda
      if (q) {
        return this.api.searchProducts(q, { limit: this.pageSize, skip }).pipe(
          map(res => <ListVm>{ products: res.products, total: res.total, loading: false }),
          catchError(() => of(<ListVm>{ products: [], total: 0, loading: false, error: 'No se pudo cargar la búsqueda.' }))
        );
      }

      // Solo categoría
      if (category !== 'all') {
        return this.api.getProductsByCategory(category, { limit: this.pageSize, skip }).pipe(
          map(res => <ListVm>{ products: res.products, total: res.total, loading: false }),
          catchError(() => of(<ListVm>{ products: [], total: 0, loading: false, error: 'No se pudo cargar la categoría.' }))
        );
      }

      // Sin filtros
      return this.api.getProducts({ limit: this.pageSize, skip }).pipe(
        map(res => <ListVm>{ products: res.products, total: res.total, loading: false }),
        catchError(() => of(<ListVm>{ products: [], total: 0, loading: false, error: 'No se pudo cargar productos.' }))
      );
    }),
    startWith({ products: [], total: 0, loading: true } as ListVm),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  onPage(evt: PageEvent): void {
    this.pageSize = evt.pageSize;
    this.pageIndex$.next(evt.pageIndex);
  }

  onViewDetails(product: Product): void {
    const ref = this.dialog.open(ProductDetailDialogComponent, {
      data: { id: product.id, preload: product },
      panelClass: 'product-dialog-panel',
      width: '55vw',
      maxWidth: '880px',
      maxHeight: '90vh',
      autoFocus: false,
      restoreFocus: true,
      closeOnNavigation: true,
      ariaDescribedBy: 'productTitle',
    });

    ref.afterClosed().subscribe(() => {
      this.snack.open('Detalle cerrado', undefined, { duration: 1500 });
    });

    console.log(product);
  }

  onDelete(prod: Product): void {
    // confirmación simple del navegador; puedes reemplazar por MatDialog custom
    const ok = confirm(`¿Eliminar "${prod.title}"?`);
    if (!ok) return;
    this.api.deleteProduct(prod.id).subscribe({
      next: (resp) => {
        console.log('Delete response:', resp);
        this.snack.open('Producto eliminado', 'Cerrar', { duration: 2500 });
        // refresca vista
        this.reload$.next();
      },
      error: () => {
        this.snack.open('No se pudo eliminar el producto', 'Cerrar', { duration: 3000 });
      }
    });
  }

}
