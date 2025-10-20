import {ChangeDetectionStrategy, Component, Input, Output, EventEmitter} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../core/models/product.model';
import {MatCard, MatCardActions, MatCardContent, MatCardModule} from '@angular/material/card';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';



@Component({
  selector: 'app-products-grid',
  imports: [
    MatCard,
    MatCardContent,
    MatIcon,
    MatCardActions,
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid">
      <mat-card *ngFor="let p of products; trackBy: trackById" class="card">
        <img mat-card-image [src]="p.thumbnail" [alt]="p.title" />
        <mat-card-content>
          <h3>{{ p.title }}</h3>
          <p style="margin: 4px 0;"><strong>{{ p.price | currency:'USD' }}</strong></p>
          <p style="margin: 0; color: #666;">{{ p.brand }} • {{ p.category }}</p>
          <p style="margin: 4px 0; color: #f57c00; display:flex; align-items:center; gap:4px;">
            <mat-icon fontIcon="star"></mat-icon>
            {{ p.rating }} / 5
          </p>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-stroked-button color="primary" (click)="viewDetails.emit(p)">Ver detalles</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; margin: 16px 0; }
    .card { display: flex; flex-direction: column; }
    img { object-fit: cover; height: 180px; margin: auto}
  `]
})
export class ProductsGridComponent {
  @Input({ required: true }) products: Product[] = [];
  @Output() viewDetails = new EventEmitter<Product>();

  trackById = (_: number, item: Product) => item.id;

}
